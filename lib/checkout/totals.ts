import { addMinor, minorToTryDecimal, tryToMinor } from '@/lib/payments/money';

export function checkoutTotal(subtotal: number, shipping: number | null) {
  const subtotalMinor = tryToMinor(subtotal, { allowZero: true });
  const shippingMinor =
    shipping == null ? null : tryToMinor(shipping, { allowZero: true });
  const totalMinor =
    shippingMinor == null ? null : addMinor(subtotalMinor, shippingMinor);

  return {
    subtotal: Number(minorToTryDecimal(subtotalMinor)),
    shipping: shippingMinor == null ? null : Number(minorToTryDecimal(shippingMinor)),
    total: totalMinor == null ? null : Number(minorToTryDecimal(totalMinor)),
  };
}
