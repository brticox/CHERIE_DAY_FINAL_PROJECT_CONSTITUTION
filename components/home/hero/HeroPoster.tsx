/**
 * HeroPoster — the always-there fallback frame beneath the WebGL stage.
 *
 * Shown to reduced-motion users, mobile, non-WebGL devices, and during
 * canvas load. Animation-free by design. Mirrors the approved abstract
 * hero composition: ivory atmosphere, red ribbon arcing to the ring/light
 * of the promise, elegant typography.
 */
export function HeroPoster() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-cherie-ivory">
      {/* sky + warm key light */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-cherie-ivory via-cherie-mist to-cherie-paper"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(58% 52% at 26% 16%, rgba(176,138,87,0.14) 0%, rgba(176,138,87,0) 60%)',
        }}
      />
      {/* light strata */}
      <div
        aria-hidden
        className="absolute -left-24 top-[14%] h-56 w-[42rem] rounded-full bg-cherie-lace/50 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-32 top-[30%] h-64 w-[46rem] rounded-full bg-cherie-mist/80 blur-3xl"
      />

      {/* the promise, suggested */}
      <div aria-hidden className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <svg
          viewBox="0 0 1200 360"
          fill="none"
          className="mx-auto w-full max-w-6xl"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="posterGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#B08A57" stopOpacity="0.5" />
              <stop offset="0.4" stopColor="#B08A57" stopOpacity="0.16" />
              <stop offset="1" stopColor="#B08A57" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d="M70 120 C 280 120, 360 250, 600 250 C 840 250, 920 120, 1130 120"
            stroke="#8F1D2C"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="600" cy="250" r="66" fill="url(#posterGlow)" />
          <circle cx="600" cy="250" r="8.5" stroke="#B08A57" strokeWidth="2.5" />
          <circle cx="600" cy="250" r="2" fill="#B08A57" />
        </svg>
      </div>

      {/* overture */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-cherie-brass">
          CHERIE DAY · Maison
        </p>
        <h1 className="mt-6 max-w-4xl text-display-xl text-cherie-ink">
          Bir dokunuşunuz yeter; gerisi bize emanet.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-cherie-soft-ink md:text-lg md:leading-8">
          İlk ‘evet’in heyecanı, son dansın ışığı sizin; davetiyeden albüme, her
          ince detay bizim.
        </p>
      </div>
    </div>
  );
}
