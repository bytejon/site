import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { href } from '../lib/site';
import type { APIContext } from 'astro';
export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({ title: 'Jon', description: 'Writing by Jon / bytejon.', site: context.site!,
    items: posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime()).map(post => ({
      title: post.data.title, description: post.data.description, pubDate: post.data.date,
      link: href(`blog/${post.id}/`), categories: post.data.tags,
    })),
  });
}
