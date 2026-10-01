import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {load} from 'cheerio';
for(const route of ['writing/demo-math-and-markdown','writing/demo-component-tutorial','projects/demo-project/reference/math','projects/demo-project/guides/components']) {
 const $=load(await readFile(`dist/${route}/index.html`,'utf8'));
 assert($('.katex math').length>1,`${route}: expected accessible MathML`);
 assert($('.katex annotation[encoding="application/x-tex"]').length>1,`${route}: expected original TeX annotations`);
 assert($('.katex-display').length>0,`${route}: missing display math`);
 assert.equal($('.katex-error').length,0,`${route}: invalid math`);
}
for(const route of ['writing/demo-hidden-draft','writing/demo-hidden-draft/child','projects/demo-project/hidden-draft']) {
 assert.equal(await access(`dist/${route}/index.html`).then(()=>true,()=>false),false,`${route}: draft route leaked`);
}
const rss=load(await readFile('dist/rss.xml','utf8'),{xmlMode:true});
assert.equal(rss('item').length,5); assert(rss('item title').toArray().every(el=>rss(el).text().startsWith('Test ')));
const sitemap=await readFile('dist/sitemap.xml','utf8'); assert(!sitemap.includes('hidden-draft'));
console.log('Verified demo math/MathML/TeX, five labeled RSS roots, and draft/ancestor/sitemap exclusion.');
