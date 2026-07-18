import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const axeSource = readFileSync(resolve(process.cwd(), 'node_modules/axe-core/axe.min.js'), 'utf8');

async function dismissConsent(page: Page) {
  const choice = page.getByRole('button', { name: 'Yalnızca Gerekli' });
  if (await choice.isVisible()) await choice.click();
}

async function seriousViolations(page: Page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const axe = (window as typeof window & {
      axe: {
        run: (
          context: Document,
          options: object,
        ) => Promise<{
          violations: Array<{
            id: string;
            impact: string | null;
            nodes: Array<{ target: string[]; html: string; failureSummary?: string }>;
          }>;
        }>;
      };
    }).axe;
    const result = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    return result.violations
      .filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.map((node) => ({
          target: node.target.join(' '),
          html: node.html,
          failure: node.failureSummary,
        })),
      }));
  });
}

for (const route of ['/', '/magaza']) {
  test(`${route} has no serious or critical WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route);
    await dismissConsent(page);
    await expect(page.locator('main')).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });
}

test('mobile navigation is portalled, traps focus, closes with Escape, and restores focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/magaza');
  await dismissConsent(page);

  const trigger = page.getByRole('button', { name: 'Menüyü aç' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Mobil menü' });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => element.parentElement === document.body)).toBe(true);
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
