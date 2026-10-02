import {chromium,expect} from '@playwright/test';
import {mkdir,readFile} from 'node:fs/promises';
const output='../tooling/visual-qa';await mkdir(output,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1280,height:900}});
async function theme(value){await page.getByRole('button',{name:'Color theme',exact:true}).first().click();await page.getByRole('listbox',{name:'Color theme',exact:true}).locator(`[data-value="${value}"]`).click();await expect(page.locator('.site-nav .nav-links a:not([aria-current])').first()).toHaveCSS('color',value==='dark'?'rgb(232, 233, 237)':'rgb(37, 44, 53)');await page.locator('body').click({position:{x:1200,y:100}});}
for(const value of ['light','dark']){
 await page.goto('http://127.0.0.1:4321/articles/demo-code-tools/');await theme(value);
 const tabs=page.locator('starlight-tabs.code-tabset').first();await tabs.waitFor();
 await page.evaluate(()=>{const tabs=document.querySelector('starlight-tabs.code-tabset');window.scrollTo(0,tabs.getBoundingClientRect().top+scrollY-150);});
 await page.screenshot({path:`${output}/code-${value}.png`});
}
await page.goto('http://127.0.0.1:4321/projects/demo-project/guides/components/');await theme('dark');await page.screenshot({path:`${output}/hierarchy-desktop-dark.png`});
await page.setViewportSize({width:390,height:900});await page.goto('http://127.0.0.1:4321/projects/demo-project/guides/components/');
await page.getByRole('button',{name:'Color theme',exact:true}).first().click();await page.getByRole('listbox',{name:'Color theme',exact:true}).locator('[data-value="light"]').click();await page.getByRole('button',{name:'Menu',exact:true}).click();await page.screenshot({path:`${output}/hierarchy-mobile-light.png`});
const images=['code-light.png','code-dark.png','hierarchy-desktop-dark.png','hierarchy-mobile-light.png'];
const titles=['Code controls · light · 1280px','Code controls · dark · 1280px','Nested project hierarchy · dark · 1280px','Nested project menu · light · 390px'];
const panels=await Promise.all(images.map(async(name,i)=>`<section><h2>${titles[i]}</h2><img src="data:image/png;base64,${(await readFile(`${output}/${name}`)).toString('base64')}" /></section>`));
await page.setViewportSize({width:2560,height:1900});await page.setContent(`<html><style>body{margin:0;background:#dededb;font-family:system-ui}.grid{display:grid;grid-template-columns:1280px 1280px}section{height:950px;overflow:hidden;display:flex;flex-direction:column;align-items:center}h2{height:50px;box-sizing:border-box;margin:0;padding:12px 24px;font-size:18px;align-self:stretch;color:#252c35}img{display:block;height:900px;width:auto;max-width:1280px}</style><div class="grid">${panels.join('')}</div></html>`);await page.screenshot({path:`${output}/jon-site-visual-review.png`});await browser.close();console.log('Captured four current local browser screenshots and a full-resolution contact sheet.');
