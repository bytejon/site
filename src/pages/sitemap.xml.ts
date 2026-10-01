import { getCollection } from 'astro:content';
import { writingPages, href } from '../lib/site';
import type { APIContext } from 'astro';
export async function GET(context: APIContext) {
  const writing = (await writingPages()).filter(p => !p.data.draft);
  const docs = await getCollection('docs');
  const paths = ['', 'writing/', 'about/', ...writing.map(p => `writing/${p.id}/`), ...docs.filter(p => p.id !== '404').map(p => `${p.id.replace(/\/index$/, '')}/`)];
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${escape(new URL(href(path), context.site).href)}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
}
