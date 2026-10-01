import { getCollection } from 'astro:content';

export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const showDrafts = import.meta.env.DEV || import.meta.env.INCLUDE_DRAFTS === 'true';
export async function posts() {
  return (await getCollection('blog', ({ data }) => showDrafts || !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
export const formatDate = (date: Date) => new Intl.DateTimeFormat('en', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
}).format(date);
