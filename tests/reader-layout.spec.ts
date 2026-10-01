import {test,expect} from '@playwright/test';
import {choose} from './choices';
test.beforeEach(()=>test.skip(process.env.TEST_DEMOS!=='true','Local demonstration content'));
test('context breadcrumbs and spacious sibling navigation work in both themes',async({page})=>{
 for(const theme of ['light','dark']) {
  await page.goto('projects/demo-project/guides/components/');await choose(page,'Color theme',theme);
  const crumbs=page.getByRole('navigation',{name:'Breadcrumb',exact:true});
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Components');
  await expect(crumbs.getByRole('link')).toHaveCount(2);
  await expect(crumbs.getByRole('link',{name:'Projects',exact:true})).toHaveAttribute('href','/projects/');
  const menu=page.getByRole('button',{name:'Menu',exact:true});if(await menu.isVisible())await menu.click();
  await expect(page.locator('.project-navigation')).toBeVisible();
  await expect(page.locator('.project-navigation .top-level > li')).toHaveCount(4);
  await expect(page.locator('.project-navigation')).not.toContainText('demo-project');
  await expect(page.locator('.project-navigation a').first()).toHaveText('Overview');
  await expect(page.locator('.project-navigation a').first()).toHaveCSS('padding-left','12px');
  if(await menu.isVisible())await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.goto('writing/demo-article-series/details/');
  await expect(page.getByRole('navigation',{name:'Breadcrumb',exact:true}).getByRole('link')).toHaveCount(3);
  await expect(page.getByRole('navigation',{name:'Breadcrumb',exact:true}).locator('[aria-current]')).toHaveText('Nested details');
  await expect(page.getByRole('navigation',{name:'Chapters',exact:true}).getByRole('link')).toHaveCount(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
test('social profiles open safely in a new tab and the logo shadow is light-only',async({page})=>{
 await page.goto('about/');
 const links=page.locator('.accounts a');await expect(links).toHaveCount(5);
 for(const link of await links.all()) {await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('rel','noopener noreferrer');}
 await expect(page.locator('.accounts li').last().locator('a')).toHaveCount(0);
 await expect(page.locator('.site-footer a[href="https://github.com/bytejon"]')).toHaveAttribute('target','_blank');
 for (const link of await page.locator('header a[href="/writing/"]').all()) await expect(link).not.toHaveAttribute('target','_blank');
 await choose(page,'Color theme','light');expect(await page.locator('.site-logo').evaluate(el=>getComputedStyle(el).filter)).toContain('drop-shadow');
 await choose(page,'Color theme','dark');await expect(page.locator('.site-logo')).toHaveCSS('filter','none');
});
