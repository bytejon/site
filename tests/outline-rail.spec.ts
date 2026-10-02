import {test,expect} from '@playwright/test';
import {choose} from './choices';
test.beforeEach(()=>test.skip(process.env.TEST_DEMOS!=='true','Local outline fixtures'));
test('article and project outlines share a right rail that follows reading position without shifting rows',async({page},info)=>{
 const original=page.viewportSize()!;
 for(const theme of ['light','dark'])for(const path of ['articles/demo-math-and-markdown/','projects/demo-project/guides/components/']){
  await page.setViewportSize(original);
  await page.goto(path);await page.addStyleTag({content:'main { padding-bottom: 1100px !important; }'});await choose(page,'Color theme',theme);
  const outline=page.locator('.reader-outline:visible'),details=outline.locator('details');
  if(await details.getAttribute('open')===null)await details.locator('summary').click();
  const links=outline.locator('nav a');expect(await links.count()).toBeGreaterThan(1);
  await expect(links.first()).toHaveCSS('text-align','right');await expect(outline.locator('ul')).toHaveCSS('border-right-width','1px');
  const second=links.nth(1),href=(await second.getAttribute('href'))!;
  const before=(await second.boundingBox())!;await second.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(new RegExp(href+'$'));
  await expect(second).toHaveAttribute('aria-current','location');
  const size=await second.evaluate(el=>{const c=getComputedStyle(el,'::after');return{width:c.width,height:parseFloat(c.height),top:c.top,right:c.right,weight:getComputedStyle(el).fontWeight};});
  expect(size.width).toBe('3px');expect(size.right).toBe('-1px');expect(size.top).toBe('2px');expect(size.weight).toBe('400');
  expect((await second.boundingBox())!.height).toBe(before.height);
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await expect(links.last()).toHaveAttribute('aria-current','location');
  await links.last().evaluate(el=>el.textContent='A longer outline label that wraps onto several lines without moving the rail '.repeat(3));
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await expect(links.last()).toHaveAttribute('aria-current','location');
  expect((await links.last().boundingBox())!.height).toBeGreaterThan(44);
  const long=await links.last().evaluate(el=>({height:el.getBoundingClientRect().height,bar:parseFloat(getComputedStyle(el,'::after').height)}));expect(long.height-long.bar).toBeCloseTo(4,0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/outline-rail-${path.replaceAll('/','-')}-${info.project.name}-${theme}.png`});
  await page.setViewportSize({width:1440,height:1000});await page.setViewportSize({width:390,height:844});const narrow=page.locator('.reader-outline:visible details');await expect(narrow).not.toHaveAttribute('open');await narrow.locator('summary').click();
  await expect(page.locator('.reader-outline:visible nav a').first()).toHaveCSS('text-align','right');
  await page.setViewportSize({width:1440,height:1000});await expect(page.locator('.reader-outline:visible details')).toHaveAttribute('open','');
  await page.goto(path+href);
  // Short documents cannot align every anchor above the reading threshold; at the bottom the final section wins.
  await expect(page.locator('.reader-outline:visible a[aria-current="location"]')).toHaveCount(1);
 }
});
