interface Entry { id: string; data: { tags: string[]; date?: Date; draft: boolean; parent?: string } }
export function relatedEntries<T extends Entry>(current: T, entries: T[], includeDemos = false): T[] {
  const topics = new Set(current.data.tags.filter(tag => tag !== 'article' && tag !== 'tutorial'));
  return entries.filter(entry => entry.id !== current.id && !entry.data.parent && !entry.data.draft && (includeDemos || !entry.id.split('/').some(part => part.startsWith('demo-'))))
    .map(entry => ({ entry, score: entry.data.tags.filter(tag => topics.has(tag)).length }))
    .filter(item => item.score > 0)
    .sort((a,b) => b.score - a.score || (b.entry.data.date?.getTime() || 0) - (a.entry.data.date?.getTime() || 0) || a.entry.id.localeCompare(b.entry.id))
    .slice(0,3).map(item => item.entry);
}
