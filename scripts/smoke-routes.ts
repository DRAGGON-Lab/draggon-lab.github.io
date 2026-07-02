import { existsSync } from 'node:fs';
import { join } from 'node:path';

const routes = [
  '/',
  '/research',
  '/tools',
  '/publications',
  '/lab-notes',
  '/teaching',
  '/people',
  '/join-collaborate',
  '/privacy',
];

const expectedRouteFiles = {
  '/': 'src/pages/index.astro',
  '/research': 'src/pages/research/index.astro',
  '/tools': 'src/pages/tools/index.astro',
  '/publications': 'src/pages/publications/index.astro',
  '/lab-notes': 'src/pages/lab-notes/index.astro',
  '/teaching': 'src/pages/teaching/index.astro',
  '/people': 'src/pages/people/index.astro',
  '/join-collaborate': 'src/pages/join-collaborate.astro',
  '/privacy': 'src/pages/privacy.astro',
};

console.log('Smoke routes');

const missingRoutes = routes.filter(
  (route) => !existsSync(join(process.cwd(), expectedRouteFiles[route])),
);

for (const route of routes) console.log(route);

if (missingRoutes.length > 0) {
  console.error('[DRG301] Error: Smoke route source validation failed.');

  for (const route of missingRoutes) {
    console.error(
      `[DRG301] Missing expected source file for ${route}: ${expectedRouteFiles[route]}`,
    );
  }

  process.exit(1);
}

console.log('All smoke route source files are present.');
