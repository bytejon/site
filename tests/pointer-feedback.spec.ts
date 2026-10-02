import {test,expect} from '@playwright/test';
import {choose} from './choices';
test('search matches theme while Menu stays boxed; footer omits name',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const theme of ['light','dark'])for(const path of ['', 'articles/', 'projects/', 'about/', ...(process.env.TEST_DEMOS==='true'?['projects/demo-sectioned/']:[])]) {
  await page.goto(path);await choose(page,'Color theme',theme);await page.mouse.move(0,0);
  const search=page.locator('header button[data-open-modal]'),picker=page.locator('header .theme-picker');
  const properties=(el:Element)=>{const c=getComputedStyle(el);return[c.width,c.height,c.backgroundColor,c.borderColor,c.borderWidth,c.borderRadius,c.color];};
  expect(await search.evaluate(properties)).toEqual(await picker.evaluate(properties));
  await expect(search).toHaveCSS('background-color','rgba(0, 0, 0, 0)');await expect(search).toHaveCSS('border-top-color','rgba(0, 0, 0, 0)');
  const menu=page.getByRole('button',{name:'Menu',exact:true});if(await menu.isVisible()){await expect(menu).not.toHaveCSS('border-top-color','rgba(0, 0, 0, 0)');await expect(menu).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');}
  await search.hover();const hovered=await search.evaluate(properties);await picker.hover();expect(await picker.evaluate(properties)).toEqual(hovered);
  await page.keyboard.press('Tab');await search.focus();await expect(search).toHaveCSS('outline-style','solid');await expect(search).toHaveCSS('outline-width','3px');
  expect((await page.locator('footer').allTextContents()).join(' ')).not.toMatch(/\bJon\b/);
  if(!path.startsWith('projects/demo'))await expect(page.locator('.site-footer a')).toHaveCount(2);
 }
});
test('touch swipe and release avoid sticky hover while retaining scroll and focus',async({page,context,browserName},info)=>{
 test.skip(browserName!=='chromium'||info.project.name!=='mobile','Actual touch gestures use Chromium mobile emulation');
 test.skip(process.env.TEST_DEMOS!=='true','Local touch fixture');
 const client=await context.newCDPSession(page);
 for(const theme of ['light','dark'])for(const [path,selector] of [['articles/','.article-entry-link'],['articles/demo-math-and-markdown/','.article-tags a'],['about/','.accounts a']]){
  await page.goto(path);await choose(page,'Color theme',theme);await page.mouse.move(0,0);
  await page.locator('main').evaluate(el=>(el as HTMLElement).style.minHeight='200vh');
  const target=page.locator(selector).first();await target.scrollIntoViewIfNeeded();const b=(await target.boundingBox())!;const before=await page.evaluate(()=>scrollY),background=await target.evaluate(el=>getComputedStyle(el).backgroundColor);
  const x=b.x+Math.min(b.width/2,100),y=Math.min(b.y+b.height/2,700);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let step=1;step<=8;step++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-step*24}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before);await expect(page.locator('html')).toHaveAttribute('data-touch-input','');
  await expect(target).toHaveCSS('background-color',background);
  await page.screenshot({path:`test-results/touch-release-${path.replaceAll('/','-')}-${theme}.png`});
  await page.keyboard.press('Tab');await target.focus();await expect(target).toHaveCSS('outline-style','solid');
 }
 await client.detach();
});
test('real mouse movement restores hover after hybrid touch; keyboard focus stays independent',async({page})=>{
 test.skip(process.env.TEST_DEMOS!=='true','Local hybrid fixture');await page.goto('articles/');
 test.skip(!await page.evaluate(()=>matchMedia('(any-hover: hover) and (any-pointer: fine)').matches),'Requires hover-capable pointer');
 const link=page.locator('.article-entry-link').first();await link.hover();await expect(link).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 await page.dispatchEvent('html','pointerdown',{pointerType:'touch',bubbles:true});await expect(link).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 await page.keyboard.press('Tab');await link.focus();await expect(link).toHaveCSS('outline-style','solid');
 await page.keyboard.press('Tab');const b=(await link.boundingBox())!;await page.mouse.move(b.x+10,b.y+10);await expect(page.locator('html')).not.toHaveAttribute('data-touch-input','');
 await expect(link).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');
});
