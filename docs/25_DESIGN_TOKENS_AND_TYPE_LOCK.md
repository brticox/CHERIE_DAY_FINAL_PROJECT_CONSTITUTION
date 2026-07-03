# DESIGN TOKENS AND TYPE LOCK

This file freezes build tokens for MVP. Designers may refine later, but implementation starts here.

## Color Tokens

```css
:root {
  --cherie-ivory: #FAF7F1;
  --cherie-paper: #F3EDE3;
  --cherie-ink: #1F1917;
  --cherie-soft-ink: #4B403C;
  --cherie-burgundy: #4A0E17;
  --cherie-cherry: #8F1D2C;
  --cherie-velvet: #2B1118;
  --cherie-brass: #B08A57;
  --cherie-lace: #E8D8C7;
  --cherie-mist: #EFE8DE;
  --cherie-success: #326A4A;
  --cherie-warning: #A96721;
  --cherie-error: #9D2B2B;
  --cherie-focus: #7F5A2D;
}
```

## Color Rules

- Core pages use ivory, paper, ink, burgundy, brass only.
- Cherry is an accent, not a background system.
- Brass is never a large fill.
- Collection palettes apply inside collection surfaces only.
- Text contrast must meet WCAG AA.

## Typography Lock

Preferred stack:

- Display: `Cormorant Garamond` or `Playfair Display` with Turkish glyph support verified.
- UI/body: `Inter` or `Manrope` with Turkish glyph support verified.

Implementation fallback:

```css
--font-display: "Cormorant Garamond", "Playfair Display", Georgia, serif;
--font-ui: "Inter", "Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Final font license must be checked before launch.

## Type Scale

| Token | Desktop | Mobile |
|---|---:|---:|
| `display-xl` | 64px / 1.05 | 38px / 1.1 |
| `h1` | 56px / 1.08 | 34px / 1.12 |
| `h2` | 42px / 1.15 | 28px / 1.18 |
| `h3` | 30px / 1.2 | 22px / 1.25 |
| `body-lg` | 18px / 1.6 | 17px / 1.55 |
| `body` | 16px / 1.6 | 16px / 1.55 |
| `small` | 14px / 1.45 | 14px / 1.45 |

## Radius / Shadow / Focus

- Radius: 4px controls, 6px cards, 8px maximum for repeated cards.
- Focus ring: 2px `--cherie-focus`, 2px offset.
- Card shadow: `0 12px 32px rgba(31, 25, 23, 0.08)`.
- Header blur: max 12px, subtle paper tint.

## Motion Tokens

- Controls: 140ms.
- Cards: 260ms.
- Drawers: 320ms.
- Opening motion: concept-specific, purposeful, reduced-motion safe, and never harmful to commerce clarity.
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Respect `prefers-reduced-motion`.

## Turkish UI Voice Samples

- Cart: `Seçimlerim`
- Checkout: `Güvenli Ödeme`
- Account: `Hesabım`
- Order tracking: `Sipariş Takibi`
- Proof approval: `Tasarım Onayı`
- Shipping: `Özenli Teslimat`
- Empty cart: `Seçimleriniz henüz boş. Size yakışacak parçaları birlikte bulalım.`
- Payment success: `Siparişiniz özenle alındı. Sıradaki adımı hesabınızdan takip edebilirsiniz.`
