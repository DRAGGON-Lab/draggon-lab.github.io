import fs from 'node:fs/promises';
import path from 'node:path';
import { format } from 'prettier';

import { buildPublicationSnapshot } from '../src/lib/publicationSync.ts';
import { isValidPublicationSnapshot, type PublicationSnapshot } from '../src/lib/publications.ts';

const snapshotPath = path.join(process.cwd(), 'src/data/publications.generated.json');
const temporaryPath = `${snapshotPath}.tmp`;
const scholarUrl = 'https://scholar.google.com/citations?user=m3sQS9cAAAAJ&hl=en&pagesize=100';

let previousSnapshot: PublicationSnapshot | undefined;
try {
  const current: unknown = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
  if (isValidPublicationSnapshot(current)) {
    previousSnapshot = current;
  } else {
    console.warn('Existing publication snapshot is invalid; refreshing without prior enrichment.');
  }
} catch {
  console.warn(
    'Existing publication snapshot is unavailable; refreshing without prior enrichment.',
  );
}

try {
  const response = await fetch(scholarUrl, {
    headers: {
      Accept: 'text/html',
      'User-Agent':
        'Mozilla/5.0 (compatible; DRAGGONLabPublicationSync/1.0; +https://draggon-lab.github.io/)',
    },
  });
  if (!response.ok) throw new Error(`Scholar request failed (${response.status}).`);

  const snapshot = await buildPublicationSnapshot({
    scholarHtml: await response.text(),
    previousSnapshot,
  });
  const serializedSnapshot = await format(JSON.stringify(snapshot), {
    parser: 'json',
    printWidth: 100,
  });
  await fs.writeFile(temporaryPath, serializedSnapshot, 'utf8');
  await fs.rename(temporaryPath, snapshotPath);
  console.log(
    `Publication snapshot refreshed: ${snapshot.publications.length} displayed publications from ${snapshot.profile.sourceRecordCount} Scholar records.`,
  );
} catch (error) {
  await fs.rm(temporaryPath, { force: true });
  if (!previousSnapshot) {
    throw new Error('Publication sync failed and no valid snapshot is available.', {
      cause: error,
    });
  }
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`Publication sync skipped; using the last good snapshot. ${message}`);
}
