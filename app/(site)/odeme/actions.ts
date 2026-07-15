'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';

import { getCart, updateCartItem } from '@/lib/cart/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { checkoutSchema, type CheckoutState } from '@/lib/validation/checkout';
import { getPaymentProviderReadiness, isOnlineProvider } from '@/lib/payments';
import { startPaymentAttempt } from '@/lib/payments/orchestrator';
import { addMinor, minorToTryDecimal, tryToMinor } from '@/lib/payments/money';
import { trustedClientIp } from '@/lib/security/client-ip';
import type { Database } from '@/lib/supabase/database.types';

type CheckoutSessionInsert = Database['public']['Tables']['checkout_sessions']['Insert'];

export async function prepareCheckoutAction(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success)
    return {
      status: 'error',
      message: 'Lütfen işaretli alanları kontrol edin.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    return {
      status: 'error',
      message: 'Güvenli ödeme altyapısı şu anda kullanılamıyor.',
    };

  const sessionClient = await createClient();
  const { data: auth } = await sessionClient.auth.getUser();
  if (!auth.user)
    return { status: 'error', message: 'Devam etmek için hesabınıza giriş yapın.' };
  const admin = createAdminClient();
  const { data: customer } = await admin
    .from('customers')
    .select('id')
    .eq('auth_user_id', auth.user.id)
    .single();
  if (!customer) return { status: 'error', message: 'Müşteri profiliniz bulunamadı.' };

  let cart = await getCart();
  const active = cart.items.filter((item) => !item.removed_at);
  if (!active.length)
    return { status: 'error', message: 'Seçimleriniz boş. Önce bir ürün ekleyin.' };
  const submittedCartTotalMinor = cart.totalMinor;
  for (const item of active) await updateCartItem(String(item.id), Number(item.quantity));
  cart = await getCart();
  if (!cart.id)
    return {
      status: 'error',
      message: 'Seçimleriniz doğrulanamadı. Lütfen sepetinizi yenileyin.',
    };
  if (cart.totalMinor !== submittedCartTotalMinor) {
    return {
      status: 'error',
      message:
        'Fiyatlarınız güncellendi. Yeni toplamı kontrol edip ödemeyi yeniden onaylayın.',
    };
  }

  const { data: shipping } = await admin
    .from('shipping_methods')
    .select('*')
    .eq('id', parsed.data.shippingMethodId)
    .eq('status', 'published')
    .single();
  if (
    !shipping ||
    (shipping.city_scope?.length && !shipping.city_scope.includes(parsed.data.city))
  )
    return {
      status: 'error',
      message: 'Seçtiğiniz teslimat yöntemi bu il için kullanılamıyor.',
      fieldErrors: { shippingMethodId: ['Başka bir teslimat yöntemi seçin.'] },
    };

  const address = {
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    country: 'TR',
    city: parsed.data.city,
    district: parsed.data.district,
    neighborhood: parsed.data.neighborhood || null,
    address_line: parsed.data.addressLine,
    postal_code: parsed.data.postalCode || null,
  };
  const { data: savedAddress, error: addressError } = await admin
    .from('customer_addresses')
    .insert({ ...address, customer_id: customer.id, type: 'delivery' })
    .select('id')
    .single();
  if (addressError)
    return { status: 'error', message: 'Teslimat adresiniz kaydedilemedi.' };

  const invoiceIdentity =
    parsed.data.invoiceType === 'kurumsal'
      ? {
          name: parsed.data.invoiceName,
          company_title: parsed.data.companyTitle,
          tax_number: parsed.data.taxNumber,
          tax_office: parsed.data.taxOffice,
        }
      : {
          name: parsed.data.invoiceName,
          identity_number: parsed.data.identityNumber || null,
        };
  const shippingAmountMinor = tryToMinor(String(shipping.base_price ?? 0), {
    allowZero: true,
  });
  const totalMinor = addMinor(cart.totalMinor, shippingAmountMinor);
  const shippingAmount = Number(minorToTryDecimal(shippingAmountMinor));
  const total = Number(minorToTryDecimal(totalMinor));
  const { data: legalRows } = await admin
    .from('legal_document_versions')
    .select('id, version, legal_documents!inner(doc_key)')
    .eq('is_current', true)
    .eq('lifecycle_state', 'published')
    .eq('approval_status', 'approved')
    .eq('needs_lawyer_review', false);
  type LegalRow = { id: string; version: string; legal_documents: { doc_key: string } };
  const legalVersions = Object.fromEntries(
    (legalRows ?? []).map((row: LegalRow) => [
      row.legal_documents.doc_key,
      { id: row.id, version: row.version },
    ]),
  );
  if (!legalVersions.on_bilgilendirme || !legalVersions.mesafeli_satis) {
    return {
      status: 'error',
      message:
        'Güncel yasal metinler yayınlanmadan ödeme özeti oluşturulamaz. Lütfen destek ekibimizle iletişime geçin.',
    };
  }
  const proofRequired = cart.items.some(
    (item) => !item.removed_at && item.requires_proof,
  );
  if (proofRequired && parsed.data.proofAcknowledged !== 'on')
    return {
      status: 'error',
      message: 'Tasarım onayı sürecini kabul etmelisiniz.',
      fieldErrors: { proofAcknowledged: ['Bu onay zorunludur.'] },
    };

  const payload: CheckoutSessionInsert = {
    customer_id: customer.id,
    cart_id: cart.id,
    delivery_address_id: savedAddress.id,
    billing_address_id: savedAddress.id,
    shipping_method_id: shipping.id,
    status: 'open',
    invoice_type: parsed.data.invoiceType,
    invoice_identity: invoiceIdentity,
    delivery_address_snapshot: address,
    billing_address_snapshot: address,
    subtotal_amount: cart.total,
    shipping_amount: shippingAmount,
    total_amount: total,
    proof_acknowledged_at: proofRequired ? new Date().toISOString() : null,
    legal_version_ids: legalVersions,
    kvkk_consent_at: new Date().toISOString(),
    distance_sales_consent_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
  const { data: existing } = await admin
    .from('checkout_sessions')
    .select('id')
    .eq('cart_id', cart.id)
    .eq('status', 'open')
    .maybeSingle();
  const result = existing
    ? await admin
        .from('checkout_sessions')
        .update(payload)
        .eq('id', existing.id)
        .select('id')
        .single()
    : await admin.from('checkout_sessions').insert(payload).select('id').single();
  if (result.error || !result.data)
    return {
      status: 'error',
      message: 'Ödeme özeti hazırlanamadı. Lütfen tekrar deneyin.',
    };

  const requestHeaders = await headers();
  const evidence = [
    {
      type: 'pre_info',
      key: 'on_bilgilendirme',
      label: 'Ön Bilgilendirme Formu’nu okudum ve kabul ediyorum.',
    },
    {
      type: 'distance_sales',
      key: 'mesafeli_satis',
      label: 'Mesafeli Satış Sözleşmesi’ni okudum ve kabul ediyorum.',
    },
  ] as const;
  for (const record of evidence) {
    const version = legalVersions[record.key];
    await admin.from('consent_records').insert({
      customer_id: customer.id,
      session_ref: String(result.data.id),
      consent_type: record.type,
      legal_document_version_id: version?.id ?? null,
      checkbox_label_snapshot: record.label,
      user_agent: requestHeaders.get('user-agent'),
      source_route: '/odeme',
    });
  }
  const requestedProvider = parsed.data.paymentProvider;
  if (requestedProvider && isOnlineProvider(requestedProvider)) {
    const readiness = getPaymentProviderReadiness().find(
      (provider) => provider.provider === requestedProvider,
    );
    if (!readiness?.configured) {
      return {
        status: 'error',
        message: 'Seçtiğiniz ödeme sağlayıcısı henüz kullanıma hazır değil.',
        sessionId: String(result.data.id),
      };
    }
    if (!auth.user.email) {
      return {
        status: 'error',
        message: 'Ödeme sağlayıcısına geçmek için hesabınızda e-posta bulunmalıdır.',
        sessionId: String(result.data.id),
      };
    }
    try {
      const identityHash = createHash('sha256')
        .update(`checkout:${auth.user.id}`)
        .digest('hex');
      const { data: allowed } = await admin.rpc('check_payment_rate_limit', {
        p_route_key: 'payment_initialization',
        p_identity_hash: identityHash,
        p_limit: 10,
        p_window_seconds: 600,
      });
      if (allowed === false) {
        return {
          status: 'error',
          message:
            'Çok sayıda ödeme denemesi yapıldı. Lütfen on dakika sonra yeniden deneyin.',
          sessionId: String(result.data.id),
        };
      }
      const payment = await startPaymentAttempt({
        checkoutSessionId: String(result.data.id),
        customerId: String(customer.id),
        provider: requestedProvider,
        email: auth.user.email,
        userIp: trustedClientIp(requestHeaders),
      });
      return {
        status: 'success',
        message:
          'Siparişiniz oluşturuldu. Kart bilgilerinizi girmek için lisanslı ödeme sağlayıcısına geçin.',
        sessionId: String(result.data.id),
        orderNumber: payment.orderNumber,
        paymentUrl: payment.paymentUrl,
      };
    } catch {
      return {
        status: 'error',
        message:
          'Ödeme sağlayıcısına güvenli bağlantı kurulamadı. Kartınızdan tutar çekilmedi.',
        sessionId: String(result.data.id),
      };
    }
  }
  return {
    status: 'success',
    message:
      'Sipariş özetiniz güvenle hazırlandı. Canlı ödeme bağlantısı açıldığında bu adımdan devam edebilirsiniz.',
    sessionId: String(result.data.id),
  };
}
