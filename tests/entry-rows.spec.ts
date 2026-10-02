import { test, expect } from '@playwright/test';
import { choose } from './choices';
test.beforeEach(() => test.skip(process.env.TEST_DEMOS !== 'true', 'Local feature demonstration content'));
for (const path of ['writing/', 'projects/', '']) {
  test(`entry titles wrap above optional metadata: ${path || 'home'}`, async ({ page }) => {
    await page.goto(path);
    const row = page.locator('.entry-row').first();
    await expect(row).toBeVisible();
    const url = await row.getAttribute('href');
    // Stress existing rendered entries without creating or publishing invented content.
    await row.locator('.entry-title').evaluate(el => el.textContent = 'A longer title about building useful tools and documenting the decisions behind them '.repeat(4));
    for (const theme of ['light', 'dark']) {
      await choose(page, 'Color theme', theme);
      const metrics = await row.evaluate(el => {
        const title = el.querySelector('.entry-title')!;
        const box = title.getBoundingClientRect();
        const children = [...el.querySelectorAll('.entry-topics,.entry-meta,.entry-description')];
        return { width: box.width, rowWidth: el.getBoundingClientRect().width, height: box.height,
          lineHeight: parseFloat(getComputedStyle(title).lineHeight), below: children.every(child => child.getBoundingClientRect().top >= box.bottom),
          overflow: document.documentElement.scrollWidth > innerWidth };
      });
      expect(metrics.width).toBeGreaterThan(metrics.rowWidth * .75);
      expect(metrics.height).toBeGreaterThan(metrics.lineHeight * 2);
      expect(metrics.below).toBe(true);
      expect(metrics.overflow).toBe(false);
      await page.screenshot({ path: `test-results/entry-${path.replaceAll('/', '') || 'home'}-${test.info().project.name}-${theme}.png`, fullPage: true });
    }
    await row.evaluate(el => el.querySelectorAll('.entry-topics,.entry-meta').forEach(child => child.remove()));
    await expect(row.locator('.entry-description')).toBeVisible();
    await row.click();
    await expect(page).toHaveURL(new RegExp(url!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
  });
}
