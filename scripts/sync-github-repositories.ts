import fs from 'node:fs/promises';
import path from 'node:path';

import { fetchGitHubRepositories } from '../src/lib/githubRepositories.ts';

const snapshotPath = path.join(process.cwd(), 'src/data/githubRepositories.generated.json');
const temporaryPath = `${snapshotPath}.tmp`;

try {
  const repositories = await fetchGitHubRepositories();
  const snapshot = {
    generatedAt: new Date().toISOString(),
    repositories,
  };

  await fs.writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryPath, snapshotPath);
  console.log(`GitHub repository snapshot refreshed: ${repositories.length} repositories.`);
} catch (error) {
  await fs.rm(temporaryPath, { force: true });

  try {
    await fs.access(snapshotPath);
  } catch {
    throw new Error('GitHub sync failed and no repository snapshot is available.', {
      cause: error,
    });
  }

  const message = error instanceof Error ? error.message : String(error);
  console.warn(`GitHub sync skipped; using the last good repository snapshot. ${message}`);
}
