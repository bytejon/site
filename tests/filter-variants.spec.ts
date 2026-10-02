import { test, expect } from '@playwright/test';
import { choose } from './choices';
test.beforeEach(() => test.skip(process.env.TEST_DEMOS !== 'true', 'Local filter fixtures'));
test('filter chips retain prior style with centered removal icons and separate display tags', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('articles/'); await choose(page, 'Color theme', theme); await choose(page, 'Tags', 'testing'); await page.keyboard.press('Escape');
    const chip = page.getByRole('button', {name:'Remove tag filter: testing',exact:true});
    const style = await chip.evaluate(el => { const c=getComputedStyle(el);return {height:c.minHeight,padding:c.padding,radius:c.borderRadius,gap:c.gap,font:c.fontSize,bg:c.backgroundColor,color:c.color}; });
    expect(style).toMatchObject({height:'44px',padding:'8px 12px',radius:'4px',gap:'10px',bg:'rgb(23, 53, 101)',color:'rgb(229, 239, 255)'});
    expect(parseFloat(style.font)).toBeCloseTo(13.12, 1);
    await expect(chip).not.toHaveClass(/entry-tag/); await expect(chip.locator('svg[aria-hidden="true"]')).toHaveCount(1);
    const display = page.locator('.entry-tag').first(); expect(await display.evaluate(el => getComputedStyle(el).borderRadius)).toBe('6px');
    expect(await display.evaluate(el => getComputedStyle(el).fontSize)).toBe('12px');
    const centered = () => chip.evaluate(el => { const a=el.querySelector('.filter-chip-label')!.getBoundingClientRect();const b=el.querySelector('svg')!.getBoundingClientRect();return Math.abs(a.y+a.height/2-b.y-b.height/2); });
    expect(await centered()).toBeLessThan(.6);
    await page.screenshot({path:`test-results/filter-restored-${info.project.name}-${theme}.png`});
    await chip.locator('.filter-chip-label').evaluate(el => el.textContent='testing a longer lowercase filter label that wraps naturally '.repeat(4));
    expect(await centered()).toBeLessThan(.6); expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/filter-long-${info.project.name}-${theme}.png`});
    await chip.locator('svg').click(); await expect(page.locator('.filter-chip')).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Clear all',exact:true})).toBeDisabled();
    const toggle=page.getByRole('button',{name:'Filters',exact:true});
    if (await toggle.getAttribute('aria-expanded')==='false') await toggle.click();
    const option=page.getByRole('group',{name:'Tags',exact:true}).getByRole('button',{name:'testing',exact:true});
    expect(await option.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeCloseTo(13.6, 1);
    expect(await option.evaluate(el=>getComputedStyle(el).borderRadius)).toBe('8px');
    expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await option.click(); await page.keyboard.press('Escape'); await chip.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.filter-chip')).toHaveCount(0);
  }
});
