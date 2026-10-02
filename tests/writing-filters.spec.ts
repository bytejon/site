import {test,expect} from '@playwright/test';
import {choose} from './choices';
test.beforeEach(()=>test.skip(process.env.TEST_DEMOS!=='true','Local tag fixtures'));
test('one tag system supports mixed selections, toggling, clearing, keyboard and history',async({page})=>{
 for(const theme of ['light','dark']) {
  await page.goto('articles/');await choose(page,'Color theme',theme);
  const toggle=page.getByRole('button',{name:'Filters',exact:true}),panel=page.locator('.filter-options'),rows=page.locator('.writing-list > li:visible');
  await expect(panel).toBeHidden();await expect(page.locator('.active-filters')).toBeHidden();
  const clear=page.getByRole('button',{name:'Clear all',exact:true});await expect(clear).toBeVisible();await expect(clear).toBeDisabled();
  for(let i=0;i<3;i++){await toggle.click();await expect(panel).toBeVisible();await toggle.click();await expect(panel).toBeHidden();}
  await toggle.focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'All tags',exact:true})).toBeFocused();
  const group=page.getByRole('group',{name:'Tags',exact:true});await expect(page.getByRole('group')).toHaveCount(1);await expect(page.getByRole('radio')).toHaveCount(0);
  await group.getByRole('button',{name:'tutorial',exact:true}).focus();await page.keyboard.press('Space');await expect(rows).toHaveCount(2);
  await expect(clear).toBeEnabled();await expect(page.locator('.filter-toolbar .filter-reset')).toHaveCount(1);
  await group.getByRole('button',{name:'navigation',exact:true}).click();await expect(rows).toHaveCount(3);
  await group.getByRole('button',{name:'article',exact:true}).click();await expect(rows).toHaveCount(5);
  await page.reload();await expect(rows).toHaveCount(5);await expect(page.locator('.filter-chip')).toHaveCount(3);
  await page.getByRole('button',{name:'Remove tag filter: article',exact:true}).click();await expect(rows).toHaveCount(3);
  await page.goBack();await expect(rows).toHaveCount(5);await page.goForward();await expect(rows).toHaveCount(3);
  await toggle.click();await group.getByRole('button',{name:'tutorial',exact:true}).click();await expect(rows).toHaveCount(2);
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
 await expect(page.locator('.filter-chip')).toHaveCount(2);await page.getByRole('button',{name:'Remove tag filter: tutorial',exact:true}).click();
 const url=new URL(page.url());expect(url.searchParams.getAll('tag')).toEqual(['navigation']);expect(url.searchParams.has('type')).toBe(false);expect(url.searchParams.has('topic')).toBe(false);expect(url.searchParams.get('source')).toBe('test');expect(url.hash).toBe('#writing');
 await page.goto('articles/?tag=Article&tag=math&tag=article&tag=unknown');await expect(page.locator('.filter-chip')).toHaveCount(2);await expect(page.locator('.writing-list > li:visible')).toHaveCount(3);
 await page.goto('articles/?tag=unknown');await expect(page.locator('.writing-list > li:visible')).toHaveCount(5);
 // A valid tag with no remaining matching rows gives a clear empty result.
 await page.evaluate(()=>document.querySelectorAll('.writing-list > li').forEach(el=>{(el as HTMLElement).dataset.tags='[]';}));
 await choose(page,'Tags','math');await expect(page.locator('[data-empty]')).toBeVisible();await expect(page.locator('.writing-list')).toBeHidden();
  await page.getByRole('button',{name:'Clear all',exact:true}).click();await expect(page.locator('.writing-list > li:visible')).toHaveCount(5);
});
test('selected tags follow all filter controls and disabled Clear all is skipped by keyboard',async({page})=>{
 for(const theme of ['light','dark']) {
  await page.goto('articles/');await choose(page,'Color theme',theme);
  const toggle=page.getByRole('button',{name:'Filters',exact:true}),clear=page.getByRole('button',{name:'Clear all',exact:true}),active=page.locator('.active-filters'),panel=page.locator('.filter-options');
  await expect(clear).toBeDisabled();await toggle.focus();await page.keyboard.press('Tab');await expect(clear).not.toBeFocused();
  await toggle.click();await expect(panel).toBeVisible();await expect(active).toBeHidden();
  const group=page.getByRole('group',{name:'Tags',exact:true});await group.getByRole('button',{name:'math',exact:true}).click();await group.getByRole('button',{name:'luau',exact:true}).click();
  await expect(active.locator('.filter-chip')).toHaveCount(2);await expect(clear).toBeEnabled();
  const positions=await page.evaluate(()=>{const panel=document.querySelector('.filter-options')!.getBoundingClientRect(),active=document.querySelector('.active-filters')!.getBoundingClientRect(),list=document.querySelector('.writing-list')!.getBoundingClientRect();return {panelBottom:panel.bottom,activeTop:active.top,activeBottom:active.bottom,listTop:list.top}});
  expect(positions.activeTop).toBeGreaterThan(positions.panelBottom);expect(positions.listTop).toBeGreaterThan(positions.activeBottom);
  await toggle.click();await expect(panel).toBeHidden();await expect(active).toBeVisible();
  await page.screenshot({path:`test-results/selected-tags-${test.info().project.name}-${theme}-collapsed.png`});
  await toggle.focus();await page.keyboard.press('Tab');await expect(clear).toBeFocused();await page.keyboard.press('Enter');await expect(clear).toBeDisabled();await expect(active).toBeHidden();await expect(page).toHaveURL(/\/articles\/$/);
  await page.goBack();await expect(active.locator('.filter-chip')).toHaveCount(2);await expect(clear).toBeEnabled();await page.goForward();await expect(clear).toBeDisabled();
  await page.goto('articles/?tag=math&tag=luau');await expect(active.locator('.filter-chip')).toHaveCount(2);await expect(clear).toBeEnabled();
  await toggle.click();await page.screenshot({path:`test-results/selected-tags-${test.info().project.name}-${theme}-expanded.png`});
  await page.getByRole('button',{name:'Remove tag filter: math',exact:true}).click();await expect(active.locator('.filter-chip')).toHaveCount(1);await page.getByRole('button',{name:'Remove tag filter: luau',exact:true}).click();await expect(active).toBeHidden();await expect(clear).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
test('detail tag links remain additive while entry tags navigate to articles',async({page})=>{
 await page.goto('articles/?tag=math&source=test');
 const row=page.locator('.entry-row').filter({hasText:'Test article: math, Markdown, and Luau'}).first();
 await expect(row.locator('a')).toHaveCount(1);
 await row.locator('.entry-tag').filter({hasText:'luau'}).click();
 await expect(page).toHaveURL(/articles\/demo-math-and-markdown\/$/);
 await page.locator('.article-tags').getByRole('link',{name:'luau',exact:true}).click();
 expect(new URL(page.url()).searchParams.getAll('tag')).toEqual(['math','luau']);
 expect(new URL(page.url()).searchParams.get('source')).toBe('test');
 await row.locator('.entry-title-link').click();
 await page.locator('.article-tags').getByRole('link',{name:'testing',exact:true}).click();
 expect(new URL(page.url()).searchParams.getAll('tag')).toEqual(['math','luau','testing']);
 await page.goto('articles/demo-math-and-markdown/');await page.locator('.article-tags').getByRole('link',{name:'luau',exact:true}).click();
 expect(new URL(page.url()).searchParams.getAll('tag')).toEqual(['luau']);
});
test('article and project pagination share outlined directional navigation',async({page})=>{
 for(const theme of ['light','dark']) {
  for(const path of ['articles/demo-article-series/first/','projects/demo-project/guides/components/']) {
   await page.goto(path);await choose(page,'Color theme',theme);const nav=page.locator('.reading-pagination');await expect(nav.locator('a')).toHaveCount(2);
   for(const link of await nav.locator('a').all()) {await expect(link.locator('svg')).toHaveCount(1);const style=await link.evaluate(el=>{const c=getComputedStyle(el);return {border:c.borderTopWidth,padding:parseFloat(c.paddingLeft),height:el.getBoundingClientRect().height}});expect(style.border).toBe('1px');expect(style.padding).toBeGreaterThanOrEqual(16);expect(style.height).toBeGreaterThanOrEqual(44);}
   await nav.scrollIntoViewIfNeeded();await nav.locator('a').first().focus();await page.screenshot({path:`test-results/pagination-${path.startsWith('articles')?'article':'project'}-${test.info().project.name}-${theme}.png`});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.goto('articles/demo-article-series/');await expect(page.locator('.reading-pagination a[rel="prev"]')).toHaveCount(0);await expect(page.locator('.reading-pagination a[rel="next"]')).toHaveCount(1);
  await page.goto('articles/demo-article-series/final/');await expect(page.locator('.reading-pagination a[rel="next"]')).toHaveCount(0);await expect(page.locator('.reading-pagination a[rel="prev"]')).toHaveCount(1);
 }
});
