import type { CollectionEntry } from 'astro:content';
import { href } from './site';
import type { HTMLAttributes } from 'astro/types';
export type ProjectNavEntry = { type: 'link'; label: string; href: string; isCurrent: boolean; attrs: HTMLAttributes<'a'> } | { type: 'group'; label: string; entries: ProjectNavEntry[]; collapsed: boolean; page?: Extract<ProjectNavEntry, {type:'link'}> };
type Doc = CollectionEntry<'docs'>;
type Node = { id: string; doc?: Doc; children: Map<string, Node> };
export function projectNavigation(docs: Doc[], current: string): ProjectNavEntry[] {
  const root = current.split('/').slice(0, 2).join('/');
  const tree: Node = { id: root, children: new Map() };
  for (const doc of docs.filter(doc => !doc.data.draft && !doc.data.sidebar.hidden && (doc.id === root || doc.id.startsWith(root + '/')))) {
    let node = tree;
    for (const part of doc.id.slice(root.length).split('/').filter(Boolean)) {
      if (!node.children.has(part)) node.children.set(part, { id: `${node.id}/${part}`, children: new Map() });
      node = node.children.get(part)!;
    }
    node.doc = doc;
  }
  const title = (node: Node) => node.doc?.data.sidebar.label || node.doc?.data.title || node.id.split('/').at(-1)!.replaceAll('-', ' ').replace(/^\w/, c => c.toUpperCase());
  const link = (doc: Doc): ProjectNavEntry => ({ type: 'link', label: doc.id === root ? 'Overview' : doc.data.sidebar.label || doc.data.title, href: href(`${doc.id}/`), isCurrent: doc.id === current, attrs: doc.data.sidebar.attrs });
  function children(node: Node): ProjectNavEntry[] {
    const nodes: Node[] = [];
    const collect = (child: Node) => { if (child.doc) nodes.push(child); else child.children.forEach(collect); };
    node.children.forEach(collect);
    return nodes.sort((a, b) => (a.doc!.data.sidebar.order ?? Infinity) - (b.doc!.data.sidebar.order ?? Infinity) || title(a).localeCompare(title(b), 'en') || a.id.localeCompare(b.id, 'en')).map(child => child.children.size ? { type: 'group', label: title(child), collapsed: true, page: link(child.doc!) as Extract<ProjectNavEntry,{type:'link'}>, entries: children(child) } : link(child.doc!));
  }
  const descendants = children(tree);
  return [...(tree.doc ? [link(tree.doc)] : []), ...descendants];
}
