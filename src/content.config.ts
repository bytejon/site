import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  writing: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
    schema: z.object({
      title: z.string(),
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
