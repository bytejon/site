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
  expect(new URL(page.url()).searchParams.get('type')).toBe('tutorial');
  expect(new URL(page.url()).searchParams.get('source')).toBe('test');
  expect(new URL(page.url()).hash).toBe('#writing');
  await page.getByRole('button',{name:'Clear all',exact:true}).click();
  await expect(page).toHaveURL(/\?source=test#writing$/);
});

test('multiple selections use OR within groups and AND between groups',async({page})=>{
 for(const theme of ['light','dark']) {
  await page.goto('writing/');await choose(page,'Color theme',theme);
  await page.getByRole('button',{name:'Filters',exact:true}).click();
  const type=page.getByRole('group',{name:'Type',exact:true});const topic=page.getByRole('group',{name:'Topic',exact:true});
  const rows=page.locator('.writing-list > li:visible');
  await expect(page.getByRole('radio')).toHaveCount(0);
  await topic.getByRole('button',{name:'math',exact:true}).click();await expect(rows).toHaveCount(1);
  await topic.getByRole('button',{name:'navigation',exact:true}).click();await expect(rows).toHaveCount(3);
  await type.getByRole('button',{name:'Tutorial',exact:true}).click();await expect(rows).toHaveCount(1);
  await type.getByRole('button',{name:'Article',exact:true}).click();await expect(rows).toHaveCount(3);
  expect(new URL(page.url()).searchParams.getAll('topic')).toEqual(['math','navigation']);
  await page.reload();await expect(rows).toHaveCount(3);await expect(page.locator('.filter-chip')).toHaveCount(4);
  await page.getByRole('button',{name:'Remove topic filter: navigation',exact:true}).click();await expect(rows).toHaveCount(1);
  await page.goBack();await expect(rows).toHaveCount(3);await page.goForward();await expect(rows).toHaveCount(1);
  await page.getByRole('button',{name:'Filters',exact:true}).click();
  await type.getByRole('button',{name:'Article',exact:true}).click();await expect(rows).toHaveCount(0);
  await expect(page.locator('[data-empty]')).toBeVisible();
  await topic.getByRole('button',{name:'math',exact:true}).click();await expect(rows).toHaveCount(2);
  await expect(topic.getByRole('button',{name:'All topics',exact:true})).toHaveAttribute('aria-pressed','true');
  await type.getByRole('button',{name:'Tutorial',exact:true}).focus();await page.keyboard.press('Space');await expect(rows).toHaveCount(5);
  await topic.getByRole('button',{name:'luau',exact:true}).click();await page.getByRole('button',{name:'Clear all',exact:true}).click();await expect(rows).toHaveCount(5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/filter-toggles-${test.info().project.name}-${theme}.png`,fullPage:true});
 }
});
