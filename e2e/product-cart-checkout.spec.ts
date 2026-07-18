import { expect, test } from '@playwright/test';
import { E2E, e2eAdmin } from './fixtures/product-cart';

test('real product image, pricing, customization, cart, and checkout stay coherent', async ({ page }) => {
  const db = e2eAdmin();
  // Resolve through the product relation so the test never assumes seed taxonomy.
  const product = await db
    .from('products')
    .select('category_id,categories!inner(departments!inner(slug))')
    .eq('id', E2E.productId)
    .single();
  expect(product.error).toBeNull();
  const relation = product.data?.categories as unknown as { departments: { slug: string } };
  expect(relation?.departments?.slug).toBeTruthy();

  await page.goto('/hesap/giris');
  await page.getByLabel('E-posta').fill(E2E.email);
  await page.getByLabel('Şifre', { exact: true }).fill(E2E.password);
  await page.getByRole('button', { name: 'Giriş Yap' }).click();
  await expect(page).toHaveURL(/\/hesap(?:\?|$)/);

  await page.goto(`/magaza/${relation.departments.slug}/${E2E.slug}`);
  await expect(page.getByRole('heading', { level: 1, name: E2E.name })).toBeVisible();
  await expect(page.getByText('₺1.000', { exact: false }).first()).toBeVisible();
  const realImage = page.getByRole('img', { name: 'Gerçek depolama görseli ile ürün akışı doğrulaması' }).first();
  await expect(realImage).toBeVisible();
  await expect(realImage).toHaveJSProperty('complete', true);
  expect(await realImage.evaluate((image: HTMLImageElement) => ({ width: image.naturalWidth, src: decodeURIComponent(image.currentSrc) })))
    .toEqual(expect.objectContaining({ width: expect.any(Number), src: expect.stringContaining('/storage/v1/object/public/public-media/e2e/') }));
  expect(await realImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

  await page.getByLabel('Premium', { exact: false }).check();
  await page.getByLabel('Adet').fill('2');
  await page.getByLabel('Kadife Hediye Kutusu', { exact: false }).check();
  await page.getByLabel('Çift isimleri').fill('Ada & Deniz');
  await expect(page.getByText('₺2.900', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: /Seçimlerim’e Ekle/ }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Seçiminiz güvenle kaydedildi.' }),
  ).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/secilimlerim$/, { timeout: 30_000 }),
    page.getByRole('link', { name: 'Seçimlerimi aç' }).click(),
  ]);

  await expect(page.getByRole('heading', { name: E2E.name })).toBeVisible();
  await expect(page.getByText('Premium', { exact: true })).toBeVisible();
  await expect(page.getByText('Kadife Hediye Kutusu', { exact: true })).toBeVisible();
  await expect(page.getByText('Ada & Deniz', { exact: true })).toBeVisible();
  await expect(page.getByText('₺2.900', { exact: false }).first()).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/odeme$/, { timeout: 30_000 }),
    page.getByRole('link', { name: /Güvenli Checkout’a Geç/ }).click(),
  ]);
  await expect(page).toHaveURL(/\/odeme$/);
  await expect(page.getByText('2 ürün', { exact: true })).toBeVisible();
  await expect(page.getByText('₺2.900', { exact: false })).toBeVisible();
  await page.getByLabel('Ad Soyad').fill('E2E Müşteri');
  await page.getByLabel('Telefon').fill('+90 555 000 00 00');
  await page.getByRole('textbox', { name: 'İl', exact: true }).fill('İstanbul');
  await page.getByRole('textbox', { name: 'İlçe', exact: true }).fill('Kadıköy');
  await page.getByLabel('Açık Adres').fill('E2E Mahallesi Test Sokak No 1');
  await page.locator('input[name="shippingMethodId"]').first().check();
  await page.getByLabel('Fatura Adı Soyadı').fill('E2E Müşteri');
  await page.getByLabel(/üretimin Tasarım Onayımdan sonra/).check();
  await page.getByLabel(/Ön Bilgilendirme Formu/).check();
  await page.getByLabel(/Mesafeli Satış Sözleşmesi/).check();
  await page.getByRole('button', { name: /Sipariş Özetini Hazırla/ }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Sipariş özetiniz güvenle hazırlandı.' }),
  ).toBeVisible();

  const customer = await db.from('customers').select('id').eq('email', E2E.email).single();
  expect(customer.error).toBeNull();
  const cart = await db.from('carts').select('id').eq('customer_id', customer.data!.id).eq('status', 'active').single();
  const item = await db.from('cart_items').select('quantity,unit_price_snapshot,total_price_snapshot,personalization_json,selected_addons_json,product_snapshot').eq('cart_id', cart.data!.id).eq('product_id', E2E.productId).single();
  expect(item.error).toBeNull();
  expect(item.data).toMatchObject({ quantity: 2, unit_price_snapshot: 1400, total_price_snapshot: 2900 });
  expect(JSON.stringify(item.data?.personalization_json)).toContain('Ada & Deniz');
  expect(JSON.stringify(item.data?.selected_addons_json)).toContain('Kadife Hediye Kutusu');
  const checkout = await db.from('checkout_sessions').select('id,cart_id,subtotal_amount,total_amount,status,legal_version_ids').eq('customer_id', customer.data!.id).eq('cart_id', cart.data!.id).single();
  expect(checkout.error).toBeNull();
  expect(checkout.data).toMatchObject({ cart_id: cart.data!.id, subtotal_amount: 2900, status: 'open' });
  expect(Number(checkout.data?.total_amount)).toBeGreaterThanOrEqual(2900);
});
