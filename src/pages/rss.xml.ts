import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { href } from '../lib/site';
import type { APIContext } from 'astro';
export async function GET(context: APIContext) {
  const posts = await getCollection('writing', ({ data }) => !data.draft && !data.parent);
  return rss({ title: 'Jon', description: 'Writing by Jon.', site: context.site!,
    items: posts.sort((a, b) => b.data.date!.getTime() - a.data.date!.getTime()).map(post => ({
      title: post.data.title, description: post.data.description, pubDate: post.data.date,
      link: href(`writing/${post.id}/`), categories: post.data.tags,
    })),
  });
}
