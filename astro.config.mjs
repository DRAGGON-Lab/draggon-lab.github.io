import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compile } from 'tailwindcss';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

const root = path.dirname(fileURLToPath(import.meta.url));
const sourceExtensions = new Set([
  '.astro',
  '.html',
  '.js',
  '.jsx',
  '.md',
  '.mdx',
  '.svelte',
  '.ts',
  '.tsx',
  '.vue',
]);

async function collectCandidates(directory) {
  const candidates = new Set();
  const entries = await fs.readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await collectCandidates(entryPath).then((nested) => {
          for (const candidate of nested) candidates.add(candidate);
        });
        return;
      }

      if (!sourceExtensions.has(path.extname(entry.name))) return;

      const contents = await fs.readFile(entryPath, 'utf8');
      for (const match of contents.matchAll(/[A-Za-z0-9_:/.[\]#%()-]+/g)) {
        candidates.add(match[0]);
      }
    }),
  );

  return candidates;
}

function tailwindBuildPlugin() {
  return {
    name: 'draggon-tailwind-build',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('/src/styles/global.css')) return null;

      const compiled = await compile(code, {
        from: id,
        base: path.dirname(id),
        async loadModule(moduleId, base) {
          const modulePath = path.resolve(base, moduleId);
          const module = await import(pathToFileURL(modulePath).href);
          return { base: path.dirname(modulePath), module: module.default ?? module };
        },
        async loadStylesheet(stylesheetId, base) {
          const stylesheetPath =
            stylesheetId === 'tailwindcss'
              ? path.join(root, 'node_modules/tailwindcss/index.css')
              : path.resolve(base, stylesheetId);

          return {
            base: path.dirname(stylesheetPath),
            content: await fs.readFile(stylesheetPath, 'utf8'),
            path: stylesheetPath,
          };
        },
      });
      const candidates = await collectCandidates(path.join(root, 'src'));

      return { code: compiled.build([...candidates]), map: null };
    },
  };
}

export default defineConfig({
  site: 'https://draggonlab.org',
  integrations: [mdx()],
  markdown: { shikiConfig: { theme: 'github-dark' } },
  vite: { plugins: [tailwindBuildPlugin()] },
});
