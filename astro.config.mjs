import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import expressiveCodeIntegration from 'astro-expressive-code';
import { expressiveCode } from './config/highlighting.mjs';

export default defineConfig({
  site: process.env.SITE_URL || 'https://jonbyte.com',
  base: process.env.SITE_BASE || '/',
  trailingSlash: 'always',
  integrations: [
    expressiveCodeIntegration(expressiveCode),
    starlight({
      title: 'Jon',
      description: 'Writing, tutorials, and open-source projects by Jon.',
      expressiveCode: false,
      customCss: ['./src/styles/site.css'],
      components: { Header: './src/components/DocsHeader.astro' },
      sidebar: [
        { label: 'Tutorials', items: [{ autogenerate: { directory: 'tutorials' } }] },
        { label: 'Projects', items: [{ autogenerate: { directory: 'projects' } }] },
      ],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/bytejon' }],
      editLink: { baseUrl: 'https://github.com/bytejon/site/edit/main/' },
    }),
    mdx(),
  ],
});
