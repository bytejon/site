import {test,expect} from '@playwright/test';
import {choose} from './choices';
import {readFileSync} from 'node:fs';
const originalSource=readFileSync('scripts/fixtures/structural-scopes.luau','utf8').replaceAll('\r\n','\n').trimEnd();
test.beforeEach(()=>test.skip(process.env.TEST_DEMOS!=='true','Local demonstration content'));

test('Luau scopes fold independently, retain source line numbers, and copy full code',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('articles/demo-code-tools/');
 const panel=page.getByRole('tabpanel',{name:'scopes.luau',exact:true});
 const frame=panel.locator('[data-code-tools]');
 await expect(frame.locator('.scope-toggle')).toHaveCount(9);
 await expect(frame.locator('.scope-toggle[aria-expanded="false"]')).toHaveCount(0);
 const lines=await frame.locator('[data-code-line]').count();
 await expect(frame.locator('.ln')).toHaveCount(lines);
 const child=frame.locator('.scope-toggle[data-fold-start="5"]');
 const parent=frame.locator('.scope-toggle[data-fold-start="4"]');
 await child.focus();await page.keyboard.press('Enter');await expect(child).toHaveAttribute('aria-expanded','false');
 await parent.click();await expect(parent).toHaveAttribute('aria-expanded','false');
 await expect(frame.locator('[data-code-line="5"]')).toBeHidden();
 await parent.click();await expect(child).toHaveAttribute('aria-expanded','false');
 await expect(frame.locator('[data-code-line="6"]')).toBeHidden();
 const visibleNumbers=await frame.locator('[data-code-line]:visible .ln').allTextContents();
 expect(visibleNumbers).toContain('5');expect(visibleNumbers).not.toContain('6');expect(visibleNumbers).toContain('15');
 await page.evaluate(()=>{const write=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async text=>{(window as any).__copiedSource=text;return write(text);};});
 await frame.locator('.copy button').click();
 const copied=await page.evaluate(()=>navigator.clipboard.readText());
 const submitted=await page.evaluate(()=>(window as any).__copiedSource as string);
 expect(submitted).toBe(originalSource);
 expect(Buffer.from(submitted).equals(Buffer.from(originalSource))).toBe(true);
 // Windows clipboard text is read back with native CRLF line endings.
 expect(copied.replaceAll('\r\n','\n')).toBe(originalSource);
 expect(copied.match(/\n/g)).toHaveLength(44);expect(copied).not.toContain('\u007f');
 expect(copied).toContain('description = [=[');expect(copied).toContain('local function summarize');expect(copied).toContain('function fake()');
 expect(copied).not.toMatch(/^\d+\s+--!strict/);
 await expect(page.locator('.expand-scopes')).toHaveCount(0);
 await child.click();
 await expect(frame.locator('[data-code-line]:visible')).toHaveCount(lines);
 const incomplete=page.locator('[data-code-tools]').filter({hasText:'local function unfinished'});
 await expect(incomplete).toHaveAttribute('data-fold-supported','false');await expect(incomplete.locator('.scope-toggle')).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('code tabs support keyboard and code surfaces remain readable in both themes',async({page})=>{
 await page.goto('articles/demo-code-tools/');
 const luau=page.getByRole('tab',{name:'scopes.luau',exact:true});
 await luau.focus();await page.keyboard.press('ArrowRight');
 const json=page.getByRole('tab',{name:'settings.json',exact:true});
 await expect(json).toHaveAttribute('aria-selected','true');await expect(json).toBeFocused();
 await expect(page.getByRole('tabpanel',{name:'settings.json',exact:true})).toBeVisible();
 await expect(page.getByRole('tabpanel',{name:'scopes.luau',exact:true})).toBeHidden();
 await expect(page.getByRole('tabpanel',{name:'settings.json',exact:true}).locator('pre')).toContainText('"features"');
 await page.keyboard.press('ArrowLeft');await expect(luau).toHaveAttribute('aria-selected','true');
 for(const theme of ['light','dark']) {
  await choose(page,'Color theme',theme);
  await expect(page.locator('.site-nav .nav-links a:not([aria-current])').first()).toHaveCSS('color',theme==='dark'?'rgb(232, 233, 237)':'rgb(37, 44, 53)');
  const frame=page.getByRole('tabpanel',{name:'scopes.luau',exact:true}).locator('[data-code-tools]');
  await expect(frame.locator('pre')).toHaveCSS('background-color',theme==='dark'?'rgb(17, 19, 21)':'rgb(241, 240, 237)');
  await expect(frame.locator('.code-toolbar')).toBeVisible();
  await expect(page.locator('starlight-tabs.code-tabset > .tablist-wrapper').first()).toHaveCSS('background-color',theme==='dark'?'rgb(17, 19, 21)':'rgb(241, 240, 237)');
  const row=await frame.locator('[data-code-line]').first().boundingBox();expect(row!.height).toBeGreaterThanOrEqual(21);expect(row!.height).toBeLessThanOrEqual(23);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('starlight-tabs.code-tabset').first().screenshot({path:`test-results/${test.info().project.name}-${theme}-code-tools.png`});
 }
 await page.goto('projects/demo-project/getting-started/');
 await expect(page.locator('[data-code-tools] .ln').first()).toBeVisible();
 await expect(page.locator('[data-code-tools] .code-toolbar').first()).toBeVisible();
});

test('mouse/touch tabs change actual code, preserve folds, and nested tabs stay independent',async({page,context})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto('articles/demo-code-tools/');
 const click=async(locator:any)=>test.info().project.name==='mobile'?locator.tap():locator.click();
 const luau=page.getByRole('tabpanel',{name:'scopes.luau',exact:true});const json=page.getByRole('tabpanel',{name:'settings.json',exact:true});
 await luau.locator('.scope-toggle[data-fold-start="4"]').click();
 await click(page.getByRole('tab',{name:'settings.json',exact:true}));await expect(luau).toBeHidden();await expect(json.locator('pre')).toContainText('"theme": "auto"');
 await json.locator('.copy button').click();expect((await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n')).toBe('{\n  "example": true,\n  "theme": "auto",\n  "features": ["line numbers", "full copy", "Luau folding"]\n}');
 await click(page.getByRole('tab',{name:'scopes.luau',exact:true}));await expect(json).toBeHidden();await expect(luau.locator('[data-code-line="5"]')).toBeHidden();
 await click(page.getByRole('tab',{name:'nested.json',exact:true}));await expect(page.getByRole('tabpanel',{name:'nested.json',exact:true}).locator('pre')).toContainText('inner JSON file');await expect(page.getByRole('tabpanel',{name:'nested.luau',exact:true})).toBeHidden();
 await click(page.getByRole('tab',{name:'Explanation',exact:true}));await expect(page.getByRole('tabpanel',{name:'Explanation',exact:true})).toContainText('outer text panel');
 await click(page.getByRole('tab',{name:'Code examples',exact:true}));await expect(page.getByRole('tabpanel',{name:'nested.json',exact:true}).locator('pre')).toBeVisible();
 await page.getByRole('tab',{name:'nested.json',exact:true}).focus();await page.keyboard.press('Home');await expect(page.getByRole('tabpanel',{name:'nested.luau',exact:true}).locator('pre')).toContainText('inner Luau file');
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('articles/demo-math-and-markdown/');const header=page.locator('[data-code-tools] .code-toolbar').first();await expect(header).toHaveCSS('padding-left','16px');expect((await header.boundingBox())!.height).toBe(44);await expect(page.locator('.expand-scopes')).toHaveCount(0);
});

test('copy feedback changes only the icon, announces the result, and resets',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('articles/demo-code-tools/');
 const frame=page.getByRole('tabpanel',{name:'scopes.luau',exact:true}).locator('[data-code-tools]');
 const toolbar=frame.locator('.code-toolbar'); const copy=frame.locator('.copy button');
 await copy.scrollIntoViewIfNeeded();
 const before=await toolbar.boundingBox(); const copyBefore=await copy.boundingBox();
 await copy.click(); await expect(copy).toHaveAttribute('data-copy-state','success');
 await expect(frame.locator('[aria-live]')).toHaveText('Copied to clipboard.');
 expect(await toolbar.boundingBox()).toEqual(before);expect(await copy.boundingBox()).toEqual(copyBefore);
 await expect(frame.locator('.feedback')).toHaveCount(0);
 await expect(copy).not.toHaveAttribute('data-copy-state',/./,{timeout:3000});
 await page.evaluate(()=>{Object.defineProperty(navigator.clipboard,'writeText',{value:()=>Promise.reject(new Error('Denied'))});document.execCommand=()=>false;});
 await copy.click();await expect(copy).toHaveAttribute('data-copy-state','error');
 await expect(frame.locator('[aria-live]')).toContainText('Copy failed');
 expect(await toolbar.boundingBox()).toEqual(before);
});
