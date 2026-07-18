import type { NotificationPayload } from '../types';

export interface EmailContent {
  title: string;
  intro: string;
  cta: string;
}

export function renderBrandedEmail(input: {
  content: EmailContent;
  customerName: string;
  identifier: string;
  href: string;
  preheader: string;
  logoUrl: string;
}) {
  const { content, customerName, identifier, href, preheader, logoUrl } = input;
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head><body style="margin:0;background:#f4eee5;color:#321b20;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4eee5"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffaf2;border:1px solid #dfd1c0"><tr><td align="center" style="padding:28px 32px;border-bottom:1px solid #dfd1c0"><img src="${escapeHtml(logoUrl)}" width="180" alt="CHERIE DAY" style="display:block;width:180px;max-width:100%;height:auto"><div style="margin-top:10px;color:#9b7b52;font-size:10px;letter-spacing:3px">İSTANBUL</div></td></tr><tr><td style="padding:38px 32px"><p style="margin:0 0 16px;color:#806b62;font-size:14px;line-height:1.5">${escapeHtml(customerName)},</p><h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.2;color:#4d1725">${escapeHtml(content.title)}</h1><p style="margin:0 0 20px;font-size:16px;line-height:1.7">${escapeHtml(content.intro)}</p>${statusPanel(identifier)}${primaryCta(content.cta, href)}</td></tr>${conciergeFooter()}</table></td></tr></table></body></html>`;
}

export function renderPlainText(input: {
  content: EmailContent;
  customerName: string;
  identifier: string;
  href: string;
  contact: string;
}) {
  return [
    input.content.title,
    '',
    `${input.customerName},`,
    '',
    input.content.intro,
    input.identifier ? `Referans: ${input.identifier}` : '',
    '',
    `${input.content.cta}: ${input.href}`,
    '',
    `Destek: ${input.contact}`,
    '',
    'Bu ileti hizmet veya operasyon bilgilendirmesidir; pazarlama iletisi değildir.',
    'CHERIE DAY · İstanbul, Türkiye',
  ].filter((line, index, lines) => line || lines[index - 1] !== '').join('\n');
}

export function templateFixture(): NotificationPayload {
  return {
    customer_name: 'Değerli misafirimiz',
    order_number: 'CD-TEST-2026',
    status: 'Hazırlanıyor',
  };
}

function statusPanel(identifier: string) {
  if (!identifier) return '';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#f8f0e7;border-left:3px solid #a8844f"><tr><td style="padding:14px 16px;color:#6b554d;font-size:13px;font-variant-numeric:tabular-nums">Referans<br><strong style="color:#4d1725;font-size:15px">${escapeHtml(identifier)}</strong></td></tr></table>`;
}

function primaryCta(label: string, href: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#6f1730" style="border-radius:6px"><a href="${escapeHtml(href)}" style="display:inline-block;min-height:44px;line-height:44px;padding:0 22px;color:#ffffff;text-decoration:none;font-weight:bold">${escapeHtml(label)}</a></td></tr></table>`;
}

function conciergeFooter() {
  return `<tr><td style="padding:22px 32px;border-top:1px solid #dfd1c0;color:#806b62;font-size:12px;line-height:1.7"><strong style="color:#4d1725">CHERIE DAY Concierge</strong><br>Bu ileti hizmet veya operasyon bilgilendirmesidir; pazarlama iletisi değildir.<br>İstanbul, Türkiye</td></tr>`;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[char] ?? char);
}
