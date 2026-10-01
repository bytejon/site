import { getCollection, type CollectionEntry } from 'astro:content';
export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const showDrafts = import.meta.env.DEV || import.meta.env.INCLUDE_DRAFTS === 'true';
export type Writing = CollectionEntry<'writing'>;
export async function writingPages() {
  const all = await getCollection('writing');
  const byId = new Map(all.map(page => [page.id, page]));
  function published(page: Writing, seen = new Set<string>()): boolean {
    if (seen.has(page.id)) throw new Error(`Writing parent cycle: ${page.id}`);
    seen.add(page.id);
    if (page.data.parent) {
      const parent = byId.get(page.data.parent);
      if (!parent) throw new Error(`Missing parent ${page.data.parent} for ${page.id}`);
      if (!published(parent, seen)) return false;
    } else if (!page.data.date) throw new Error(`Root writing entry needs a date: ${page.id}`);
    return showDrafts || !page.data.draft;
  }
  return all.filter(page => published(page));
}
export async function posts() {
  return (await writingPages()).filter(page => !page.data.parent)
    .sort((a, b) => b.data.date!.getTime() - a.data.date!.getTime());
}
export function rootOf(page: Writing, pages: Writing[]): Writing {
  return page.data.parent ? rootOf(pages.find(p => p.id === page.data.parent)!, pages) : page;
}
export function chapterTree(root: Writing, pages: Writing[], depth = 0): { page: Writing; depth: number }[] {
  return [{ page: root, depth }, ...pages.filter(p => p.data.parent === root.id)
    .sort((a,b) => a.data.order - b.data.order || a.id.localeCompare(b.id))
    .flatMap(child => chapterTree(child, pages, depth + 1))];
}
export const formatDate = (date: Date) => new Intl.DateTimeFormat('en', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
}).format(date);
