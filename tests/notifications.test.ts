import { afterEach, describe, expect, it, vi } from 'vitest';

import { getNotificationConfig, notificationBaseUrl, notificationReadiness, notificationReplyTo } from '@/lib/notifications/config';
import { notificationEventCatalog } from '@/lib/notifications/catalog';
import { NotificationError, classifyNotificationError, redactError } from '@/lib/notifications/errors';
import { notificationIdempotencyKey } from '@/lib/notifications/idempotency';
import { CaptureTransport } from '@/lib/notifications/providers/capture';
import { ResendTransport } from '@/lib/notifications/providers/resend';
import { nextRetryAt, shouldRetry } from '@/lib/notifications/retry';
import { escapeHtml, renderTemplate, requiredLaunchTemplateKeys, templateDefinitions } from '@/lib/notifications/templates';
import { resolveRecipient } from '@/lib/notifications/recipients';

const originalEnv = { ...process.env };
afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('transactional templates', () => {
  it('keeps the complete canonical event catalog unique and policy-complete', () => {
    expect(notificationEventCatalog.length).toBeGreaterThanOrEqual(40);
    expect(new Set(notificationEventCatalog.map((event) => event.eventKey)).size).toBe(
      notificationEventCatalog.length,
    );
    for (const event of notificationEventCatalog) {
      expect(event.trigger).toBeTruthy();
      expect(event.source).toBeTruthy();
      expect(event.templateKey).toBeTruthy();
      expect(event.deduplicationKey.length).toBeGreaterThan(8);
      expect(event.deduplicationKey).toContain(':');
      expect(event.adminOwner).toBeTruthy();
      expect(event.retention).toBeTruthy();
      expect(templateDefinitions[event.templateKey]).toBeDefined();
    }
  });

  it('keeps every required launch template renderable in HTML and plain text', () => {
    expect(requiredLaunchTemplateKeys).toHaveLength(56);
    for (const key of requiredLaunchTemplateKeys) {
      expect(templateDefinitions[key]).toBeDefined();
      const rendered = renderTemplate(key, { customer_name: 'Test Misafiri' });
      expect(rendered.html).toContain('alt="CHERIE DAY"');
      expect(rendered.text).toContain('CHERIE DAY');
    }
  });

  it.each(Object.keys(templateDefinitions))('renders HTML and text for %s', (key) => {
    const rendered = renderTemplate(key, { customer_name: 'Şule & Çağrı', order_number: 'CD-ÇĞ-123' });
    expect(rendered.subject).toContain('CD-ÇĞ-123');
    expect(rendered.html).toContain('<!doctype html>');
    expect(rendered.html).toContain('Şule &amp; Çağrı');
    expect(rendered.text).toContain('Şule & Çağrı');
    expect(rendered.text).toContain('http');
  });

  it('escapes unsafe customer content', () => {
    const rendered = renderTemplate('order_received', {
      customer_name: '<img src=x onerror=alert(1)>',
      order_number: 'CD-1<script>',
    });
    expect(rendered.html).not.toContain('<script>');
    expect(rendered.html).not.toContain('<img src=x');
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('uses safe fallbacks when optional values are absent', () => {
    const rendered = renderTemplate('intake_contact_received', {});
    expect(rendered.text).toContain('Değerli misafirimiz');
    expect(rendered.subject).not.toContain('undefined');
  });
});

describe('idempotency, retries and redaction', () => {
  it('builds deterministic idempotency keys', () => {
    expect(notificationIdempotencyKey('payment_success', 'p1', 'event7')).toBe('payment_success:p1:event7');
  });

  it('distinguishes retryable and permanent failures', () => {
    expect(classifyNotificationError(new NotificationError('bad', 'invalid_email', false)).retryable).toBe(false);
    expect(classifyNotificationError(new Error('network timeout')).retryable).toBe(true);
  });

  it('applies bounded exponential retry and maximum attempts', () => {
    const before = Date.now();
    expect(nextRetryAt(1, 0).getTime() - before).toBeGreaterThanOrEqual(299_900);
    expect(nextRetryAt(4, 0).getTime() - before).toBeGreaterThanOrEqual(43_199_900);
    expect(shouldRetry(true, 4, 5)).toBe(true);
    expect(shouldRetry(true, 5, 5)).toBe(false);
  });

  it('redacts email and secret-like values', () => {
    const value = redactError('failed user@example.com token_abcdefghijk');
    expect(value).not.toContain('user@example.com');
    expect(value).not.toContain('abcdefghijk');
  });
});

describe('safe transport configuration', () => {
  it('sends the provider request with a stable idempotency key and records the provider id', async () => {
    const request = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 're_launch_proof' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', request);
    const result = await new ResendTransport(
      're_test_only_not_a_secret',
      'CHERIE DAY <hello@example.test>',
    ).send({
      to: 'customer@example.test',
      subject: 'Siparişiniz alındı',
      preheader: 'Siparişiniz alındı',
      html: '<p>Siparişiniz alındı</p>',
      text: 'Siparişiniz alındı',
      idempotencyKey: 'order_received:order-1:customer',
    });
    expect(result).toEqual({ provider: 'resend', messageId: 're_launch_proof' });
    const init = request.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(init.headers).get('Idempotency-Key')).toBe(
      'order_received:order-1:customer',
    );
  });

  it('classifies provider throttling as retryable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'rate limited' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    await expect(
      new ResendTransport('re_test_only_not_a_secret', 'hello@example.test').send({
        to: 'customer@example.test', subject: 'Test', preheader: 'Test',
        html: '<p>Test</p>', text: 'Test', idempotencyKey: 'retry:test:provider',
      }),
    ).rejects.toMatchObject({ code: 'resend_429', retryable: true });
  });

  it('captures locally and never sends real mail by default', async () => {
    process.env.APP_ENV = 'development';
    process.env.NOTIFICATION_SEND_ENABLED = 'false';
    expect(notificationReadiness()).toEqual({ ready: false, mode: 'capture' });
    const result = await new CaptureTransport().send({
      to: 'test@example.com', subject: 'Test', preheader: 'Test', html: '<p>Test</p>', text: 'Test', idempotencyKey: 'test:1',
    });
    expect(result.messageId).toBe('capture:test:1');
  });

  it('rejects unsafe production recipient override', () => {
    process.env.APP_ENV = 'production';
    process.env.NOTIFICATION_SEND_ENABLED = 'false';
    process.env.NOTIFICATION_RECIPIENT_OVERRIDE = 'test@example.com';
    expect(() => getNotificationConfig()).toThrow('Production ortamında');
  });

  it('requires provider settings when real sending is enabled', () => {
    process.env.APP_ENV = 'production';
    process.env.NOTIFICATION_SEND_ENABLED = 'true';
    delete process.env.RESEND_API_KEY;
    delete process.env.NOTIFICATION_FROM_EMAIL;
    expect(() => getNotificationConfig()).toThrow('Resend');
  });

  it('fails closed when staging sending has no approved recipient list', () => {
    process.env.APP_ENV = 'staging';
    process.env.NOTIFICATION_SEND_ENABLED = 'true';
    process.env.RESEND_API_KEY = 're_test_only_not_a_secret';
    process.env.NOTIFICATION_FROM_EMAIL = 'hello@example.test';
    delete process.env.NOTIFICATION_STAGING_RECIPIENT_ALLOWLIST;
    expect(() => getNotificationConfig()).toThrow('onaylı alıcı');
  });

  it('blocks recipients outside the staging allowlist', () => {
    process.env.APP_ENV = 'staging';
    process.env.NOTIFICATION_SEND_ENABLED = 'true';
    process.env.RESEND_API_KEY = 're_test_only_not_a_secret';
    process.env.NOTIFICATION_FROM_EMAIL = 'hello@example.test';
    process.env.NOTIFICATION_STAGING_RECIPIENT_ALLOWLIST = 'approved@example.test';
    expect(resolveRecipient('customer', 'approved@example.test')).toBe('approved@example.test');
    expect(() => resolveRecipient('customer', 'blocked@example.test')).toThrow('onaylı listede');
  });

  it('rejects localhost links in hosted email environments', () => {
    process.env.APP_ENV = 'staging';
    process.env.NOTIFICATION_SEND_ENABLED = 'false';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
    expect(() => notificationBaseUrl()).toThrow('localhost');
  });

  it('routes customer replies to the responsible human inbox', () => {
    process.env.APP_ENV = 'development';
    process.env.NOTIFICATION_SEND_ENABLED = 'false';
    process.env.EMAIL_HELLO = 'hello@example.test';
    process.env.EMAIL_SUPPORT = 'support@example.test';
    process.env.EMAIL_ORDERS = 'orders@example.test';
    process.env.EMAIL_PAYMENTS = 'payments@example.test';
    expect(notificationReplyTo('intake_contact_received')).toBe('hello@example.test');
    expect(notificationReplyTo('order_status_shipped')).toBe('orders@example.test');
    expect(notificationReplyTo('refund_succeeded')).toBe('payments@example.test');
    expect(notificationReplyTo('account_welcome')).toBe('support@example.test');
  });
});
