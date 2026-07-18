import { expect, test, type Page } from '@playwright/test';

const STORAGE_KEY = 'cherie-cookie-consent';
const BANNER = 'Çerez tercihleri';
const ANALYTICS_PATTERN =
  /google-analytics|googletagmanager|gtag|segment\.io|mixpanel|facebook\.net|doubleclick|hotjar|clarity\.ms/i;

async function setConsent(page: Page, value: string) {
  await page.addInitScript((v) => window.localStorage.setItem('cherie-cookie-consent', v), value);
}

const validConsent = (action: 'accept_all' | 'reject_optional' = 'accept_all') =>
  JSON.stringify({
    version: '2026-07-18',
    sessionRef: '123e4567-e89b-42d3-a456-426614174000',
    action,
    categories: {
      necessary: true,
      analytics: action === 'accept_all',
      marketing: action === 'accept_all',
    },
    updatedAt: '2026-07-18T10:00:00.000Z',
  });

async function storedConsent(page: Page) {
  const value = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  return value ? JSON.parse(value) : null;
}

test.describe('cookie consent banner', () => {
  test('no stored consent: banner shows with all three choices', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('dialog', { name: BANNER });
    await expect(banner).toBeVisible();
    await expect(banner.getByText('Deneyiminizi iyileştirmek için çerezler kullanıyoruz.', { exact: false })).toBeVisible();
    await expect(banner.getByRole('link', { name: 'Çerez Politikası' })).toBeVisible();
    await expect(banner.getByRole('button', { name: 'Tümünü Kabul Et' })).toBeVisible();
    await expect(banner.getByRole('button', { name: 'Yalnızca Gerekli' })).toBeVisible();
    await expect(banner.getByRole('button', { name: 'Tercihleri Yönet' })).toBeVisible();
  });

  test('accept all: hides banner, persists choice, stays hidden on reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Tümünü Kabul Et' }).click();
    await expect(page.getByRole('dialog', { name: BANNER })).toBeHidden();
    expect(await storedConsent(page)).toMatchObject({
      action: 'accept_all',
      categories: { necessary: true, analytics: true, marketing: true },
    });

    await page.reload();
    await expect(page.getByRole('dialog', { name: BANNER })).toBeHidden();
  });

  test('reject optional: hides banner, persists choice, stays hidden on reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Yalnızca Gerekli' }).click();
    await expect(page.getByRole('dialog', { name: BANNER })).toBeHidden();
    expect(await storedConsent(page)).toMatchObject({
      action: 'reject_optional',
      categories: { necessary: true, analytics: false, marketing: false },
    });

    await page.reload();
    await expect(page.getByRole('dialog', { name: BANNER })).toBeHidden();
  });

  test('manage preferences: stores granular categories and links to the preference page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Tercihleri Yönet' }).click();
    await page.getByLabel('Analitik').check();
    await page.getByRole('button', { name: 'Seçimi Kaydet' }).click();
    expect(await storedConsent(page)).toMatchObject({
      action: 'configure',
      categories: { necessary: true, analytics: true, marketing: false },
    });
    await page.goto('/kurumsal/cerez-tercihleri');
    await expect(page).toHaveURL(/\/kurumsal\/cerez-tercihleri$/);
    await expect(page.getByLabel('Analitik')).toBeChecked();
    await expect(page.getByLabel('Pazarlama')).not.toBeChecked();
  });

  test('malformed or legacy stored value: reopens consent instead of treating it as permission', async ({ page }) => {
    await setConsent(page, 'legacy_unknown_value_v1');
    await page.goto('/');
    await expect(page.getByRole('dialog', { name: BANNER })).toBeVisible();
  });

  test('already-consented state has no flash of the banner on load', async ({ page }) => {
    await setConsent(page, validConsent());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('dialog', { name: BANNER })).toBeHidden();
  });

  test('hydration consistency: no console errors or React hydration warnings', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') messages.push(msg.text());
    });
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await expect(page.getByRole('dialog', { name: BANNER })).toBeVisible();

    const hydrationIssues = messages.filter((m) => /hydrat/i.test(m));
    expect(hydrationIssues).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('no analytics or marketing requests fire before a consent choice is made', async ({ page }) => {
    const analyticsRequests: string[] = [];
    page.on('request', (req) => {
      if (ANALYTICS_PATTERN.test(req.url())) analyticsRequests.push(req.url());
    });

    await page.goto('/');
    await expect(page.getByRole('dialog', { name: BANNER })).toBeVisible();
    await page.waitForTimeout(500);

    expect(analyticsRequests).toEqual([]);
  });

  test('visual regression: mobile viewport with banner visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByRole('dialog', { name: BANNER })).toBeVisible();
    await expect(page).toHaveScreenshot('cookie-consent-mobile.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });

  test('visual regression: desktop viewport with banner visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('dialog', { name: BANNER })).toBeVisible();
    await expect(page).toHaveScreenshot('cookie-consent-desktop.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });

  test('keyboard focus reaches the banner controls', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('dialog', { name: BANNER });
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: 'Tümünü Kabul Et' }).focus();
    await expect(banner.getByRole('button', { name: 'Tümünü Kabul Et' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(banner.getByRole('button', { name: 'Yalnızca Gerekli' })).toBeFocused();
  });
});
