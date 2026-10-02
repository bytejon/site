import { test, expect } from '@playwright/test';
import { choose } from './choices';
test.beforeEach(() => test.skip(process.env.TEST_DEMOS !== 'true', 'Local filter fixtures'));
test('quiet filtering supports disclosure, removal, reset, empty results, and browser history', async ({ page }) => {
  await page.goto('writing/');
  const toggle = page.getByRole('button', { name: 'Filters', exact: true });
  const panel = page.locator('.filter-options');
  const rows = page.locator('.writing-list > li:visible');
  for (const theme of ['light', 'dark']) {
    await choose(page, 'Color theme', theme);
    await expect(panel).toBeHidden();
    await expect(page.locator('.active-filters')).toBeHidden();
    await expect(rows).toHaveCount(5);
    await page.screenshot({path:`test-results/filters-quiet-${test.info().project.name}-${theme}.png`,fullPage:true});
    for(let i=0;i<3;i++) {
      await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded','true'); await expect(panel).toBeVisible();
      await toggle.click(); await expect(panel).toBeHidden();
    }
    await choose(page, 'Type', 'tutorial'); await choose(page, 'Topic', 'math');
    await expect(rows).toHaveCount(0); await expect(page.locator('[data-empty]')).toBeVisible();
    await expect(page.locator('.filter-chip')).toHaveCount(2);
    await page.getByRole('button', {name:'Remove topic filter: math',exact:true}).click();
    await expect(rows).toHaveCount(2);
    await page.getByRole('button', {name:'Remove type filter: Tutorial',exact:true}).click();
    await expect(rows).toHaveCount(5); await expect(toggle).toBeFocused();
    await choose(page,'Type','article'); await expect(rows).toHaveCount(3);
    await choose(page,'Topic','luau'); await expect(rows).toHaveCount(2);
    await page.goBack(); await expect(rows).toHaveCount(3); await expect(page.locator('input[name="topic"]')).toHaveValue('');
    await page.goForward(); await expect(rows).toHaveCount(2);
    await page.reload(); await expect(rows).toHaveCount(2); await expect(panel).toBeHidden();
    await expect(page.locator('.filter-chip')).toHaveCount(2);
    await toggle.click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/filters-open-${test.info().project.name}-${theme}.png`,fullPage:true});
    await page.getByRole('button',{name:'Clear all',exact:true}).click();
    await expect(rows).toHaveCount(5); await expect(page.locator('.active-filters')).toBeHidden();
    await page.keyboard.press('Escape'); await expect(panel).toBeHidden(); await expect(toggle).toBeFocused();
  }
});
test('URL filters restore safely and unrelated query parameters survive',async({page})=>{
  await page.goto('writing/?type=unknown&topic=unknown&source=test#writing');
  await expect(page.locator('.writing-list > li:visible')).toHaveCount(5);
  await expect(page.locator('.active-filters')).toBeHidden();
  await choose(page,'Type','tutorial');
  await expect(page).toHaveURL(/\?type=tutorial&source=test#writing$/);
  await page.getByRole('button',{name:'Clear all',exact:true}).click();
  await expect(page).toHaveURL(/\?source=test#writing$/);
});
