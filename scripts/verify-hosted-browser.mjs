import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

const baseUrl = process.env.HOSTED_BASE_URL;
const bypass = process.env.X_VERCEL_PROTECTION_BYPASS;
const deploymentId = process.env.HOSTED_DEPLOYMENT_ID;
const deploymentSha = process.env.HOSTED_DEPLOYMENT_SHA;

if (!baseUrl || !bypass || !deploymentId || !deploymentSha) {
  throw new Error(
    'HOSTED_BASE_URL, X_VERCEL_PROTECTION_BYPASS, HOSTED_DEPLOYMENT_ID and HOSTED_DEPLOYMENT_SHA are required.',
  );
}

const widths = [1440, 1280, 1024, 768, 430, 390, 375, 320];
const routes = [
  '/',
  '/magaza',
  '/magaza/davetiye/muhurlu-bahce-davetiyesi',
  '/hizmetler',
  '/kurumsal/gizlilik',
  '/yardim',
  '/hesap/giris',
];
const evidenceRoot = path.resolve('docs/evidence/phase-3-5-hosted-e2e');
const screenshotRoot = path.join(evidenceRoot, 'screenshots');

await mkdir(screenshotRoot, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const width of widths) {
    for (const route of routes) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        extraHTTPHeaders: { 'x-vercel-protection-bypass': bypass },
      });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));

      let response;
      let navError = null;
      try {
        response = await page.goto(new URL(route, baseUrl).toString(), {
          waitUntil: 'networkidle',
          timeout: 45_000,
        });
      } catch (error) {
        navError = error instanceof Error ? error.message : String(error);
      }

      const pageState = await page.evaluate(() => {
        const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
        const text = document.body.innerText;
        const selector = [
          'a[href]',
          'button:not([disabled])',
          'input:not([type="hidden"]):not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[role="button"]',
          '[tabindex]:not([tabindex="-1"])',
        ].join(',');
        const targets = [...document.querySelectorAll(selector)].filter((element) => {
          if (!(element instanceof HTMLElement)) return false;
          if (element.closest('[aria-hidden="true"]')) return false;
          if (element.closest('.sr-only')) return false;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            Number(style.opacity) > 0
          );
        });
        const undersizedTargets = targets
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              label:
                element.getAttribute('aria-label') ||
                element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ||
                element.tagName.toLowerCase(),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            };
          })
          .filter((target) => target.width < 44 || target.height < 44);

        return {
          title: document.title,
          lang: document.documentElement.lang,
          metaRobots: robots,
          overflow: document.documentElement.scrollWidth > window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          badOverlay: /application error|internal server error/i.test(text),
          textLength: text.length,
          focusables: targets.length,
          undersizedTargets,
        };
      });

      const xRobots = response?.headers()['x-robots-tag'] ?? '';
      const result = {
        width,
        route,
        status: response?.status() ?? null,
        navError,
        xRobots,
        noindex:
          /noindex/i.test(xRobots) || /noindex/i.test(pageState.metaRobots),
        ...pageState,
        undersized: pageState.undersizedTargets.length,
        consoleErrors,
        pageErrors,
      };
      results.push(result);

      if (route === '/') {
        await page.screenshot({
          path: path.join(screenshotRoot, `home-${width}.png`),
          fullPage: true,
        });
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const failures = results.filter(
  (result) =>
    result.status !== 200 ||
    result.navError ||
    !result.noindex ||
    result.overflow ||
    result.badOverlay ||
    result.undersized > 0 ||
    result.consoleErrors.length > 0 ||
    result.pageErrors.length > 0,
);
const summary = {
  deploymentId,
  deploymentSha,
  checks: results.length,
  failures: failures.length,
  widths,
  routes,
  maxUndersized: Math.max(...results.map((result) => result.undersized)),
  checksWithZeroUndersized: results.filter((result) => result.undersized === 0).length,
  noindexChecks: results.filter((result) => result.noindex).length,
  overflowChecksPassed: results.filter((result) => !result.overflow).length,
  consoleCleanChecks: results.filter(
    (result) => result.consoleErrors.length === 0 && result.pageErrors.length === 0,
  ).length,
};

await writeFile(
  path.join(evidenceRoot, 'browser-matrix.json'),
  `${JSON.stringify({ deploymentId, deploymentSha, results }, null, 2)}\n`,
);
await writeFile(
  path.join(evidenceRoot, 'browser-summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
);

console.log(JSON.stringify(summary, null, 2));
if (failures.length > 0) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
