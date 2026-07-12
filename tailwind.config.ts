import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Tailwind theme is bound to the CSS variables defined in styles/globals.css,
 * which are the frozen design tokens from docs/25_DESIGN_TOKENS_AND_TYPE_LOCK.md.
 * Do not hardcode brand hex values in components — always go through these tokens.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx,md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cherie: {
          // rgb(<triplet> / <alpha-value>) keeps the frozen token single-source
          // in globals.css while enabling opacity modifiers (/85 etc.).
          ivory: 'rgb(var(--cherie-ivory-rgb) / <alpha-value>)',
          paper: 'rgb(var(--cherie-paper-rgb) / <alpha-value>)',
          ink: 'rgb(var(--cherie-ink-rgb) / <alpha-value>)',
          'soft-ink': 'rgb(var(--cherie-soft-ink-rgb) / <alpha-value>)',
          burgundy: 'rgb(var(--cherie-burgundy-rgb) / <alpha-value>)',
          cherry: 'rgb(var(--cherie-cherry-rgb) / <alpha-value>)',
          velvet: 'rgb(var(--cherie-velvet-rgb) / <alpha-value>)',
          brass: 'rgb(var(--cherie-brass-rgb) / <alpha-value>)',
          lace: 'rgb(var(--cherie-lace-rgb) / <alpha-value>)',
          mist: 'rgb(var(--cherie-mist-rgb) / <alpha-value>)',
          success: 'rgb(var(--cherie-success-rgb) / <alpha-value>)',
          warning: 'rgb(var(--cherie-warning-rgb) / <alpha-value>)',
          error: 'rgb(var(--cherie-error-rgb) / <alpha-value>)',
          focus: 'rgb(var(--cherie-focus-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: 'var(--font-display)',
        ui: 'var(--font-ui)',
      },
      borderRadius: {
        control: '8px',
        card: '12px',
        'card-lg': '18px',
      },
      boxShadow: {
        card: '0 20px 60px rgba(31, 25, 23, 0.10)',
        lift: '0 28px 80px rgba(31, 25, 23, 0.14)',
      },
      transitionTimingFunction: {
        cherie: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        control: '140ms',
        card: '260ms',
        drawer: '320ms',
      },
      ringColor: {
        focus: 'var(--cherie-focus)',
      },
    },
  },
  plugins: [animate],
};

export default config;
