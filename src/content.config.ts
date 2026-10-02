import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { normalizeTags } from './lib/tags';
import { docsSchema } from '@astrojs/starlight/schema';

// Demo fixtures are opt-in even during development. Never enable this in CI.
const includeDemos = import.meta.env.INCLUDE_DEMOS === 'true';
const pattern = includeDemos ? '**/[^_]*.{md,mdx}' : ['**/[^_]*.{md,mdx}', '!**/demo-*', '!**/demo-*/**'];
const projectSection = z.object({ id: z.string().min(1), label: z.string().min(1), order: z.number().optional(), collapsed: z.boolean().default(true) });

export const collections = {
  docs: defineCollection({ loader: glob({ pattern, base: './src/content/docs' }), schema: docsSchema({ extend: z.object({ sections: z.array(projectSection).default([]), section: z.string().min(1).optional(), tags: z.array(z.string()).default([]), date: z.coerce.date().optional(), overview: z.object({ summary: z.string().optional(), installation: z.string().optional(), source: z.url().refine(value => /^https?:/.test(value), 'Use an HTTP(S) source URL').optional(), docs: z.string().refine(value => /^\/(?!\/)|^https?:\/\//.test(value), 'Use a site path or HTTP(S) docs URL').optional() }).optional() }) }) }),
  writing: defineCollection({
    loader: glob({ pattern, base: './src/content/writing' }),
    schema: z.object({
      title: z.string(),
      navTitle: z.string().optional(),
      description: z.string(),
      date: z.coerce.date().optional(),
      updated: z.coerce.date().optional(),
      type: z.enum(['article', 'tutorial']).optional(),
      parent: z.string().optional(),
      order: z.number().default(0),
      toc: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(true),
    }).transform(data => ({ ...data, tags: normalizeTags(data.tags, data.type) })),
  }),
};
