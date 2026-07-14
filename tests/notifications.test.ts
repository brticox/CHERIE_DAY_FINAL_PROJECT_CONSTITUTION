import { afterEach, describe, expect, it } from 'vitest';

import { getNotificationConfig, notificationReadiness } from '@/lib/notifications/config';
import { NotificationError, classifyNotificationError, redactError } from '@/lib/notifications/errors';
import { notificationIdempotencyKey } from '@/lib/notifications/idempotency';
import { CaptureTransport } from '@/lib/notifications/providers/capture';
import { nextRetryAt, shouldRetry } from '@/lib/notifications/retry';
import { escapeHtml, renderTemplate, templateDefinitions } from '@/lib/notifications/templates';

const originalEnv = { ...process.env };
afterEach(() => {
  process.env = { ...originalEnv };
});

describe('transactional templates', () => {
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
    expect(nextRetryAt(1, 0).getTime() - before).toBeGreaterThanOrEqual(59_900);
    expect(nextRetryAt(5, 0).getTime() - before).toBeGreaterThanOrEqual(21_599_900);
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
});
