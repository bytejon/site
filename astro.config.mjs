import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCodeIntegration from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';
import { staticSearch } from './config/search.mjs';

export default defineConfig({
  site: process.env.SITE_URL || 'https://jonbyte.com',
  base: process.env.SITE_BASE || '/',
  trailingSlash: 'always',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { output: 'htmlAndMathml', throwOnError: true, trust: false }]],
    }),
  },
  integrations: [
    expressiveCodeIntegration(),
    starlight({
      // The shared Search dialog uses the index written by staticSearch below.
      pagefind: false,
      title: 'Jon',
      favicon: '/favicon.svg',
      description: 'Articles, tutorials, and open-source projects by Jon.',
      expressiveCode: false,
      customCss: ['./src/styles/site.css'],
      components: {
        Header: './src/components/DocsHeader.astro',
        PageTitle: './src/components/DocsPageTitle.astro',
        Pagination: './src/components/DocsPagination.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
        Sidebar: './src/components/DocsSidebar.astro',
        MobileMenuToggle: './src/components/DocsMenuButton.astro',
        MobileMenuFooter: './src/components/DocsMobileFooter.astro',
      },
      sidebar: [
        { label: 'Projects', items: [{ autogenerate: { directory: 'projects' } }] },
      ],
    }),
    sitemap({ filter: page => !/\/(blog|tutorials|writing)(\/|$)/.test(new URL(page).pathname) }),
    mdx(),
    staticSearch(),
  ],
});
