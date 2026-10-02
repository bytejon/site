import {test,expect} from '@playwright/test';
import {choose} from './choices';
test.beforeEach(()=>test.skip(process.env.TEST_DEMOS!=='true','Local tag fixtures'));
test('one tag system supports mixed selections, toggling, clearing, keyboard and history',async({page})=>{
 for(const theme of ['light','dark']) {
  await page.goto('articles/');await choose(page,'Color theme',theme);
  const toggle=page.getByRole('button',{name:'Filters',exact:true}),panel=page.locator('.filter-options'),rows=page.locator('.writing-list > li:visible');
  await expect(panel).toBeHidden();await expect(page.locator('.active-filters')).toBeHidden();
  for(let i=0;i<3;i++){await toggle.click();await expect(panel).toBeVisible();await toggle.click();await expect(panel).toBeHidden();}
  await toggle.focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'All tags',exact:true})).toBeFocused();
  const group=page.getByRole('group',{name:'Tags',exact:true});await expect(page.getByRole('group')).toHaveCount(1);await expect(page.getByRole('radio')).toHaveCount(0);
  await group.getByRole('button',{name:'Tutorial',exact:true}).focus();await page.keyboard.press('Space');await expect(rows).toHaveCount(2);
  await group.getByRole('button',{name:'navigation',exact:true}).click();await expect(rows).toHaveCount(3);
  await group.getByRole('button',{name:'Article',exact:true}).click();await expect(rows).toHaveCount(5);
  await page.reload();await expect(rows).toHaveCount(5);await expect(page.locator('.filter-chip')).toHaveCount(3);
  await page.getByRole('button',{name:'Remove tag filter: Article',exact:true}).click();await expect(rows).toHaveCount(3);
  await page.goBack();await expect(rows).toHaveCount(5);await page.goForward();await expect(rows).toHaveCount(3);
  await toggle.click();await group.getByRole('button',{name:'Tutorial',exact:true}).click();await expect(rows).toHaveCount(2);
  await group.getByRole('button',{name:'navigation',exact:true}).click();await expect(rows).toHaveCount(5);await expect(page.locator('.active-filters')).toBeHidden();
  await group.getByRole('button',{name:'luau',exact:true}).click();await group.getByRole('button',{name:'math',exact:true}).click();await expect(rows).toHaveCount(3);
  await page.screenshot({path:`test-results/unified-tags-${test.info().project.name}-${theme}.png`,fullPage:true});
  await group.getByRole('button',{name:'All tags',exact:true}).click();await expect(rows).toHaveCount(5);
  await group.getByRole('button',{name:'math',exact:true}).click();await page.getByRole('button',{name:'Clear all',exact:true}).click();await expect(rows).toHaveCount(5);await expect(toggle).toBeFocused();
  await page.keyboard.press('Escape');await expect(panel).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
test('legacy and repeated tag URLs normalize into the same match-any selection',async({page})=>{
 await page.goto('articles/?type=tutorial&topic=navigation&source=test#writing');await expect(page.locator('.writing-list > li:visible')).toHaveCount(3);
 await expect(page.locator('.filter-chip')).toHaveCount(2);await page.getByRole('button',{name:'Remove tag filter: Tutorial',exact:true}).click();
 const url=new URL(page.url());expect(url.searchParams.getAll('tag')).toEqual(['navigation']);expect(url.searchParams.has('type')).toBe(false);expect(url.searchParams.has('topic')).toBe(false);expect(url.searchParams.get('source')).toBe('test');expect(url.hash).toBe('#writing');
 await page.goto('articles/?tag=Article&tag=math&tag=article&tag=unknown');await expect(page.locator('.filter-chip')).toHaveCount(2);await expect(page.locator('.writing-list > li:visible')).toHaveCount(3);
 await page.goto('articles/?tag=unknown');await expect(page.locator('.writing-list > li:visible')).toHaveCount(5);
 // A valid tag with no remaining matching rows gives a clear empty result.
 await page.evaluate(()=>document.querySelectorAll('.writing-list > li').forEach(el=>{(el as HTMLElement).dataset.tags='[]';}));
 await choose(page,'Tags','math');await expect(page.locator('[data-empty]')).toBeVisible();await expect(page.locator('.writing-list')).toBeHidden();
 await page.getByRole('button',{name:'Clear all',exact:true}).click();await expect(page.locator('.writing-list > li:visible')).toHaveCount(5);
});
