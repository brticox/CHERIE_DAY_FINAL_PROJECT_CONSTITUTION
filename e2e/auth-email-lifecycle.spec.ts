import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const email = 'auth-email-e2e@cherie.test';
const initialPassword = 'Cherie-Auth-2026!';
const updatedPassword = 'Cherie-Updated-2026!';
const mailpit = 'http://127.0.0.1:54324';

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !['127.0.0.1', 'localhost'].includes(new URL(url).hostname)) {
    throw new Error('Auth email E2E is restricted to local Supabase.');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

test.beforeEach(async () => cleanup());
test.afterEach(async () => cleanup());

test('registration, confirmation, welcome, recovery and password-change email events are connected', async ({ page }) => {
  const db = admin();
  await page.goto('/hesap/kayit');
  await page.getByLabel('Ad Soyad').fill('E-posta Yaşam Döngüsü');
  await page.getByLabel('E-posta').fill(email);
  await page.getByLabel('Şifre', { exact: true }).fill(initialPassword);
  await page.getByLabel('Şifre Tekrar').fill(initialPassword);
  await page.getByLabel(/KVKK Aydınlatma Metni/).check();
  await page.getByRole('button', { name: 'Hesabımı Oluştur' }).click();
  await expect(page.getByRole('status')).toContainText('Doğrulama bağlantısını');

  const confirmation = await mailLink(email, 'doğrulayın');
  await page.goto(confirmation);
  await expect(page).toHaveURL(/\/hesap(?:\?|$)/);

  const customer = await db.from('customers').select('id').eq('email', email).single();
  expect(customer.error).toBeNull();
  const welcome = await db
    .from('notification_outbox')
    .select('id,status,idempotency_key')
    .eq('customer_id', customer.data!.id)
    .eq('template_key', 'account_welcome');
  expect(welcome.error).toBeNull();
  expect(welcome.data).toHaveLength(1);
  expect(welcome.data?.[0]?.status).toBe('queued');

  await processNotifications(page);
  const sentWelcome = await db
    .from('notification_outbox')
    .select('status,provider,provider_message_id,attempts')
    .eq('id', welcome.data![0]!.id)
    .single();
  expect(sentWelcome.data).toMatchObject({ status: 'sent', provider: 'capture', attempts: 1 });
  expect(sentWelcome.data?.provider_message_id).toContain(welcome.data![0]!.idempotency_key);

  await page.context().clearCookies();
  await page.goto('/hesap/sifremi-unuttum');
  await page.getByLabel('E-posta').fill(email);
  await page.getByRole('button', { name: 'Yenileme Bağlantısı Gönder' }).click();
  await expect(page.getByRole('status')).toContainText('bir hesap varsa');
  const recovery = await mailLink(email, 'yenileyin');
  await page.goto(recovery);
  await expect(page).toHaveURL(/\/hesap\/sifreyi-yenile/);
  await page.getByLabel('Yeni Şifre').fill(updatedPassword);
  await page.getByLabel('Şifre Tekrar').fill(updatedPassword);
  await page.getByRole('button', { name: 'Şifremi Güncelle' }).click();
  await expect(page).toHaveURL(/\/hesap\/giris\?reason=password_updated/);
  await expect(page.getByText('Şifreniz güvenle güncellendi')).toBeVisible();

  const passwordChanged = await db
    .from('notification_outbox')
    .select('id,status,idempotency_key')
    .eq('customer_id', customer.data!.id)
    .eq('template_key', 'auth-password-changed');
  expect(passwordChanged.error).toBeNull();
  expect(passwordChanged.data).toHaveLength(1);
  expect(passwordChanged.data?.[0]?.idempotency_key).toContain('auth_password_changed:');
  await processNotifications(page);
  const sentPasswordChanged = await db
    .from('notification_outbox')
    .select('status,provider,attempts')
    .eq('id', passwordChanged.data![0]!.id)
    .single();
  expect(sentPasswordChanged.data).toMatchObject({ status: 'sent', provider: 'capture', attempts: 1 });
});

async function processNotifications(page: import('@playwright/test').Page) {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error('CRON_SECRET is required for the local worker proof.');
  const response = await page.request.get('/api/internal/notifications/process', {
    headers: { Authorization: `Bearer ${secret}` },
  });
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ ok: true });
}

async function mailLink(recipient: string, subjectFragment: string) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const list = (await fetch(`${mailpit}/api/v1/messages`).then((response) => response.json())) as {
      messages: Array<{
        ID: string;
        Subject: string;
        To: Array<{ Address: string }>;
      }>;
    };
    const message = list.messages.find(
      (candidate) =>
        candidate.To.some((to) => to.Address.toLowerCase() === recipient) &&
        candidate.Subject.toLocaleLowerCase('tr-TR').includes(subjectFragment),
    );
    if (message) {
      const detail = (await fetch(`${mailpit}/api/v1/message/${message.ID}`).then((response) =>
        response.json(),
      )) as { HTML?: string; Text?: string };
      const content = `${detail.HTML ?? ''}\n${detail.Text ?? ''}`.replaceAll('&amp;', '&');
      const match = content.match(
        /https?:\/\/[^\s"'<>]+\/auth\/(?:v1\/verify|confirm)\?[^\s"'<>]+/,
      );
      if (match) return match[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Mailpit message not found for ${recipient}: ${subjectFragment}`);
}

async function cleanup() {
  const db = admin();
  const users = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;
  for (const user of users.data.users.filter((candidate) => candidate.email === email)) {
    const deleted = await db.auth.admin.deleteUser(user.id);
    if (deleted.error) throw deleted.error;
  }
  const messages = (await fetch(`${mailpit}/api/v1/messages`).then((response) =>
    response.json(),
  )) as { messages: Array<{ ID: string; To: Array<{ Address: string }> }> };
  for (const message of messages.messages.filter((candidate) =>
    candidate.To.some((to) => to.Address.toLowerCase() === email),
  )) {
    await fetch(`${mailpit}/api/v1/messages/${message.ID}`, { method: 'DELETE' });
  }
}
