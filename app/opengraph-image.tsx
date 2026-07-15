import { ImageResponse } from 'next/og';

/**
 * Default social card for every route (docs/13 OG strategy). Rendered from the
 * frozen brand tokens (docs/25) — ivory paper, brass hairline, burgundy word —
 * so no external raster asset is required. Individual routes may override this.
 */
export const runtime = 'nodejs';
export const alt = 'CHERIE DAY — Düğün, Hediye ve Kutlama Maison’u';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#faf7f1',
          backgroundImage:
            'radial-gradient(circle at 12% 8%, rgba(176,138,87,0.16), transparent 46%), radial-gradient(circle at 88% 92%, rgba(74,14,23,0.10), transparent 44%)',
          fontFamily: 'serif',
          color: '#1f1917',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            letterSpacing: 8,
            fontSize: 22,
            textTransform: 'uppercase',
            color: '#b08a57',
          }}
        >
          <div style={{ width: 44, height: 1, backgroundColor: '#b08a57' }} />
          Maison
          <div style={{ width: 44, height: 1, backgroundColor: '#b08a57' }} />
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 128,
            fontWeight: 600,
            letterSpacing: 4,
            color: '#4a0e17',
          }}
        >
          CHERIE DAY
        </div>
        <div style={{ marginTop: 20, fontSize: 34, color: '#4b403c' }}>
          Düğün · Hediye · Kutlama
        </div>
        <div style={{ marginTop: 44, fontSize: 24, color: '#4b403c' }}>
          Türkiye’ye özel lüks kutlama maison’u
        </div>
      </div>
    ),
    { ...size },
  );
}
