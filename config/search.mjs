import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pagefind from 'pagefind';

/** @returns {import('astro').AstroIntegration} */
export function staticSearch() {
  return {
    name: 'site:static-search',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        try {
          const created = await pagefind.createIndex();
          if (created.errors.length || !created.index) throw new Error(created.errors.join('\n') || 'No search index returned');
          const added = await created.index.addDirectory({ path: fileURLToPath(dir) });
          if (added.errors.length) throw new Error(added.errors.join('\n'));
          // Get the complete assets in memory and await Node's writes before closing
          // the native service. A prior CI artifact contained an empty manifest.
          const { files, errors } = await created.index.getFiles();
          if (errors.length || !files) throw new Error(errors.join('\n') || 'No search assets returned');
          const entry = files.find(file => file.path === 'pagefind-entry.json');
          if (!entry?.content.byteLength) throw new Error('Search manifest is empty');
          const manifest = JSON.parse(Buffer.from(entry.content).toString('utf8'));
          if (!manifest.languages?.en?.page_count) throw new Error('Search index has no English pages');
          const output = fileURLToPath(new URL('./pagefind/', dir));
          await Promise.all(files.map(async file => {
            if (!file.content.byteLength) throw new Error(`Empty search asset: ${file.path}`);
            const target = join(output, file.path);
            await mkdir(dirname(target), { recursive: true });
            await writeFile(target, file.content);
          }));
          logger.info(`Wrote ${files.length} complete search assets for ${manifest.languages.en.page_count} indexed pages.`);
        } finally {
          await pagefind.close();
        }
      },
    },
  };
}
