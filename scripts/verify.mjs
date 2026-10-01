import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { load } from 'cheerio';
import { createHighlighter } from 'shiki';
import { luau } from '../config/highlighting.mjs';

const base = (process.env.SITE_BASE || '/').replace(/\/$/, '');
const origin = process.env.SITE_URL || 'https://jonbyte.com';
const drafts = process.env.INCLUDE_DRAFTS === 'true';
async function walk(dir) {
  const items = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(items.map(item => item.isDirectory() ? walk(join(dir, item.name)) : join(dir, item.name)))).flat();
}
const files = await walk('dist');
const htmlFiles = files.filter(file => file.endsWith('.html'));
assert(htmlFiles.length >= 6, 'Expected home, blog, about, docs, and 404 pages');
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  if (/http-equiv=["']refresh/i.test(html)) continue;
  if (!drafts) assert(!html.includes('Authoring example'), `Draft leaked into ${file}`);
  const $ = load(html);
  assert.equal($('html').attr('lang'), 'en');
  assert.equal($('h1').length, 1, `${file}: expected one h1`);
  assert($('title').text().length > 0);
  const relativePath = file.replaceAll('\\', '/').replace(/^dist/, '');
  const pageURL = new URL(`${base}${relativePath.replace(/index\.html$/, '')}`, origin);
  for (const node of $('a[href], script[src], link[href], img[src]')) {
    if (file.endsWith('404.html') && $(node).attr('rel') === 'canonical') continue;
    const raw = $(node).attr('href') || $(node).attr('src');
    if (!raw || raw.startsWith('#') || raw.startsWith('data:') || raw.startsWith('mailto:')) continue;
    const url = new URL(raw, pageURL);
    if (url.origin !== new URL(origin).origin) continue;
    assert(!base || url.pathname === base || url.pathname.startsWith(`${base}/`), `${file}: missing base in ${raw}`);
    let target = decodeURIComponent(url.pathname.slice(base.length));
    if (target.endsWith('/')) target += 'index.html';
    if (!target) target = '/index.html';
    const targetFile = join('dist', target);
    assert(await stat(targetFile).then(s => s.isFile()).catch(() => false), `${file}: broken link/asset ${raw}`);
    if (url.hash && targetFile.endsWith('.html')) {
      const targetHTML = load(await readFile(targetFile, 'utf8'));
      assert(targetHTML(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).length, `${file}: broken anchor ${raw}`);
    }
  }
}
const feed = await readFile('dist/rss.xml', 'utf8');
assert(!feed.includes('Authoring example'), 'Draft leaked into RSS');
if (!drafts) assert(!files.some(file => file.includes('authoring-example')), 'Draft route was built');

assert.equal(luau.name, 'luau');
assert.equal(luau.scopeName, 'source.luau');
const highlighter = await createHighlighter({ themes: ['github-light'], langs: [luau] });
const sample = 'export type Point = { x: number }\nlocal p: Point = { x = 1 }\nlocal label = `Point: {p.x}`\ncontinue';
const tokens = highlighter.codeToTokensBase(sample, { lang: 'luau', theme: 'github-light', includeExplanation: true });
const scopeTokens = tokens.flat().map(token => ({ content: token.content, scopes: token.explanation?.flatMap(e => e.scopes.map(s => s.scopeName)) || [] }));
for (const word of ['export', 'type', 'number', 'continue']) {
  const token = scopeTokens.find(t => t.content.trim() === word);
  assert(token && token.scopes.some(s => s.endsWith('.luau') && s !== 'source.luau'), `${word}: missing Luau-specific scope`);
}
assert(scopeTokens.some(t => t.scopes.some(s => /interpolat|template/.test(s))), 'Luau string interpolation not tokenized');
highlighter.dispose();
if (drafts) {
  const example = load(await readFile('dist/writing/authoring-example/index.html', 'utf8'));
  assert(example('aside[aria-label="Custom component example"]').length, 'MDX component did not render');
  assert(example('.expressive-code pre[data-language="luau"]').length, 'Luau fence did not render with Expressive Code');
  assert(example('.expressive-code span[style]').length > 10, 'Expected syntax-colored Luau tokens');
  assert(example('.expressive-code button').length, 'Missing code copy button');
}
console.log(`Verified ${htmlFiles.length} pages: links/assets/anchors, metadata, draft policy, RSS, dedicated Luau scopes${drafts ? ', MDX component and rendered Luau fence' : ''}.`);
