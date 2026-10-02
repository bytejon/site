import {test,expect} from '@playwright/test';
import {choose} from './choices';
test('Articles is canonical and old listing links retain filters and anchors',async({page})=>{
 await page.goto('writing/?tag=luau&tag=math#main');
 await expect(page).toHaveURL(/\/articles\/\?tag=luau&tag=math#main$/);
 await expect(page.locator('h1')).toHaveText('Articles');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://jonbyte.com/articles/');
 await expect(page).toHaveTitle(/Articles/);
 for(const theme of ['light','dark']){
  await choose(page,'Color theme',theme);
  const menu=page.getByRole('button',{name:'Menu',exact:true});if(await menu.isVisible())await menu.click();
  const nav=page.locator('header a[aria-current]:visible');await expect(nav).toHaveText('Articles');
  await expect(page.getByRole('link',{name:'Writing',exact:true})).toHaveCount(0);
  if(await menu.isVisible())await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.goto('');await expect(page.getByRole('heading',{name:'Recent articles',exact:true})).toBeVisible();
 const sitemap=await(await page.request.get('sitemap.xml')).text();expect(sitemap).toContain('/articles/');expect(sitemap).not.toContain('/writing/');
 const automatic=await(await page.request.get('sitemap-0.xml')).text();expect(automatic).not.toContain('/writing/');
});
test('old details/nested routes redirect to canonical articles and search/feed omit aliases',async({page})=>{
 test.skip(process.env.TEST_DEMOS!=='true','Local route fixtures');
 for(const path of ['demo-math-and-markdown','demo-article-series/details','demo-tutorial-series/final']){
  await page.goto(`writing/${path}/?source=test#main`);await expect(page).toHaveURL(new RegExp(`/articles/${path}/\\?source=test#main$`));
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://jonbyte.com/articles/${path}/`);
  await expect(page.getByRole('navigation',{name:'Breadcrumb',exact:true}).getByRole('link',{name:'Articles',exact:true})).toBeVisible();
 }
 const feed=await(await page.request.get('rss.xml')).text();expect(feed).toContain('/articles/demo-');expect(feed).not.toContain('/writing/');
 await page.goto('articles/demo-math-and-markdown/');
 const urls=await page.evaluate(async()=>{const modulePath='/pagefind/pagefind.js';const search=await import(modulePath);const result=await search.search('Test');return Promise.all(result.results.map(async(item:{data:()=>Promise<{url:string}>})=>(await item.data()).url));});
 expect(urls.some(url=>url.startsWith('/articles/'))).toBe(true);expect(urls.some(url=>url.startsWith('/writing/'))).toBe(false);
});
