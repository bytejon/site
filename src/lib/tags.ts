// Legacy writing `type` becomes an ordinary tag; new entries need only tags.
export function normalizeTags(tags: string[] = [], legacyType?: string): string[] {
  const values = [...new Set([...(legacyType ? [legacyType] : []), ...tags].map(tag => tag.trim().toLowerCase()).filter(Boolean))];
  return [...values.filter(tag => tag === 'article' || tag === 'tutorial'), ...values.filter(tag => tag !== 'article' && tag !== 'tutorial')];
}
export const tagLabel = (tag: string) => tag === 'article' ? 'Article' : tag === 'tutorial' ? 'Tutorial' : tag;
