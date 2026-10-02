import type { CollectionEntry } from 'astro:content';
import { href } from './site';
import type { HTMLAttributes } from 'astro/types';
export type ProjectNavEntry = { type: 'link'; label: string; href: string; isCurrent: boolean; attrs: HTMLAttributes<'a'> } | { type: 'group'; label: string; entries: ProjectNavEntry[]; collapsed: boolean; section?: boolean; page?: Extract<ProjectNavEntry, {type:'link'}> };
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
  const definitions = tree.doc?.data.sections || [];
  const sections = new Map<string, typeof definitions[number]>();
  for (const definition of definitions) {
    if (sections.has(definition.id)) throw new Error(`Duplicate project section ${definition.id} in ${root}`);
    sections.set(definition.id, definition);
  }
  for (const doc of docs.filter(doc => !doc.data.draft && !doc.data.sidebar.hidden && doc.id.startsWith(root + '/'))) {
    if (doc.data.section && !sections.has(doc.data.section)) throw new Error(`Unknown project section ${doc.data.section} on ${doc.id}`);
    const parts = doc.id.split('/');
    for (let depth = parts.length - 1; depth > 2; depth--) {
      const ancestor = docs.find(parent => parent.id === parts.slice(0,depth).join('/') && !parent.data.draft && !parent.data.sidebar.hidden);
      if (!ancestor) continue;
      if (!ancestor.data.section && depth > 3) continue;
      if (doc.data.section && doc.data.section !== ancestor.data.section) throw new Error(`Nested page ${doc.id} must inherit the section of ${ancestor.id}; set section only on its root sibling page`);
      break;
    }
  }
  const documents = new Map(docs.map(doc => [doc.id, doc]));
  const grouped = new Map<string, ProjectNavEntry[]>();
  const ordered: { entry: ProjectNavEntry; order: number; id: string }[] = [];
  for (const entry of children(tree)) {
    const page = entry.type === 'link' ? entry : entry.page!;
    const id = page.href.slice(href().length).replace(/\/$/, '');
    const doc = documents.get(id)!;
    if (doc.data.section) {
      if (!sections.has(doc.data.section)) throw new Error(`Unknown project section ${doc.data.section} on ${id}`);
      if (!grouped.has(doc.data.section)) grouped.set(doc.data.section, []);
      grouped.get(doc.data.section)!.push(entry);
    } else ordered.push({ entry, order: doc.data.sidebar.order ?? Infinity, id });
  }
  for (const [id, entries] of grouped) {
    const section = sections.get(id)!;
    ordered.push({ entry: { type: 'group', section: true, label: section.label, collapsed: section.collapsed, entries }, order: section.order ?? Infinity, id });
  }
  ordered.sort((a,b) => a.order - b.order || a.entry.label.localeCompare(b.entry.label,'en') || a.id.localeCompare(b.id,'en'));
  return [...(tree.doc ? [link(tree.doc)] : []), ...ordered.map(item => item.entry)];
}
