import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://draggonlab.org',
  integrations: [mdx()],
  markdown: { shikiConfig: { theme: 'github-dark' } },
});
