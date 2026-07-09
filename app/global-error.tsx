'use client';

/** Root fallback if the root layout itself throws. Must render its own html/body. */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="tr">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          background: '#faf7f1',
          color: '#1f1917',
          display: 'flex',
          minHeight: '100dvh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <h1 style={{ fontSize: '1.75rem' }}>Şu an bir aksaklık yaşıyoruz</h1>
        <p style={{ marginTop: '1rem', maxWidth: '28rem', color: '#4b403c' }}>
          Ekibimiz durumdan haberdar. Birazdan tekrar deneyebilirsiniz.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 1.5rem',
            background: '#4a0e17',
            color: '#faf7f1',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Tekrar Dene
        </button>
      </body>
    </html>
  );
}
