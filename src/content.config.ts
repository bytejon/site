import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Demo fixtures are opt-in even during development. Never enable this in CI.
const includeDemos = import.meta.env.INCLUDE_DEMOS === 'true';
const pattern = includeDemos ? '**/[^_]*.{md,mdx}' : ['**/[^_]*.{md,mdx}', '!**/demo-*', '!**/demo-*/**'];

export const collections = {
  docs: defineCollection({ loader: glob({ pattern, base: './src/content/docs' }), schema: docsSchema() }),
  writing: defineCollection({
    loader: glob({ pattern, base: './src/content/writing' }),
    schema: z.object({
      title: z.string(),
      navTitle: z.string().optional(),
      description: z.string(),
      date: z.coerce.date().optional(),
      type: z.enum(['article', 'tutorial']).default('article'),
      parent: z.string().optional(),
      order: z.number().default(0),
      toc: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(true),
    }),
  }),
};
