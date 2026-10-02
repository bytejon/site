import { test, expect } from '@playwright/test';
import { choose } from './choices';
test.beforeEach(() => test.skip(process.env.TEST_DEMOS !== 'true', 'Local article fixtures'));
test('whole article entries provide one native link and matching static chips', async ({ page, context }, info) => {
  for (const theme of ['light', 'dark']) for (const path of ['articles/', '', 'articles/demo-math-and-markdown/']) {
    await page.goto(path); await choose(page, 'Color theme', theme);
    const row = page.locator('.article-entry').first(), link = row.locator('a');
    const destination = new URL((await link.getAttribute('href'))!, page.url()).href;
    await expect(row.locator('a')).toHaveCount(1); await expect(row.locator('a a,button,[tabindex]')).toHaveCount(0);
    const boxes = await row.evaluate(el => ({ row: el.getBoundingClientRect().toJSON(), link: el.querySelector('a')!.getBoundingClientRect().toJSON() }));
    expect(boxes.row).toEqual(boxes.link);
    const chip = row.locator('.entry-tag').first();
    const style = await chip.evaluate(el => { const c = getComputedStyle(el); return [c.fontSize,c.lineHeight,c.padding,c.borderRadius,c.backgroundColor,c.color,c.border]; });
    await chip.hover();
    if(await page.evaluate(()=>matchMedia('(any-hover: hover) and (any-pointer: fine)').matches)) await expect.poll(() => link.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
    else await expect(link).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
    await page.keyboard.press('Tab'); await link.focus(); await expect(link).toBeFocused();
    await expect.poll(() => link.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
    await page.keyboard.press('Tab'); await expect(link).not.toBeFocused(); await expect(chip).not.toBeFocused();
    await page.screenshot({path:`test-results/whole-entry-${path.replaceAll('/','-') || 'home'}-${info.project.name}-${theme}.png`});
    if (info.project.name === 'mobile') await chip.tap(); else await chip.click();
    await expect(page).toHaveURL(destination);
    const detail = page.locator('.article-tags a').first();
    expect(await detail.evaluate(el => { const c = getComputedStyle(el); return [c.fontSize,c.lineHeight,c.padding,c.borderRadius,c.backgroundColor,c.color,c.border]; })).toEqual(style);
    await page.goto(path); const current = page.locator('.article-entry a').first();
    await current.focus(); await page.keyboard.press('Enter'); await expect(page).toHaveURL(destination);
    await page.goto(path); const native = page.locator('.article-entry a').first(); await native.scrollIntoViewIfNeeded();
    const bounds = (await native.boundingBox())!;
    await native.click({position:{x:bounds.width-3,y:bounds.height-3}}); await expect(page).toHaveURL(destination);
  }
  await page.goto('articles/'); const link = page.locator('.article-entry a').first();
  const destination = new URL((await link.getAttribute('href'))!, page.url()).href;
  const popup = context.waitForEvent('page'); await link.click({modifiers:['Control']});
  const opened = await popup; await opened.waitForLoadState(); await expect(opened).toHaveURL(destination); await opened.close();
  await expect(page).toHaveURL(/articles\/$/);
});
