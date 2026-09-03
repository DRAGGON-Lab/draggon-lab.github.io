import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import {
  citationRadius,
  filterPublications,
  isValidPublicationSnapshot,
  mergePublications,
  normalizeTitle,
  placePublicationsChronologically,
  publicationToBibtex,
  remapCitationEdges,
  sortPublications,
  type Publication,
} from '../src/lib/publications.ts';
import {
  isBlockedScholarResponse,
  matchOpenAlexWork,
  parseScholarProfile,
  type OpenAlexWork,
} from '../src/lib/publicationSync.ts';

const fixture = (name: string) =>
  fs.readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const publication = (overrides: Partial<Publication> = {}): Publication => ({
  id: 'one',
  title: 'A publication',
  authors: ['G Vidal'],
  venue: 'Journal',
  year: 2024,
  publicationDate: '2024-01-01',
  type: 'journal article',
  scholarCitations: 2,
  scholarUrl: 'https://scholar.google.com/example',
  doi: null,
  openAlexId: null,
  versions: [],
  ...overrides,
});
const work = (overrides: Partial<OpenAlexWork> = {}): OpenAlexWork => ({
  id: 'https://openalex.org/W1',
  doi: null,
  title: 'A publication',
  publication_date: '2024-01-01',
  type: 'article',
  referenced_works: [],
  ...overrides,
});

test('Scholar fixtures parse duplicates, missing years, zero citations, and metrics', async () => {
  const parsed = parseScholarProfile(await fixture('scholar-profile.html'));
  assert.deepEqual(
    { name: parsed.name, citations: parsed.totalCitations, h: parsed.hIndex, i10: parsed.i10Index },
    { name: 'Gonzalo Vidal', citations: 222, h: 8, i10: 7 },
  );
  assert.equal(parsed.records.length, 2);
  assert.equal(parsed.records[0].title, 'Example & test');
  assert.equal(parsed.records[1].year, null);
  assert.equal(parsed.records[1].scholarCitations, 0);
  const corrected = parseScholarProfile(
    (await fixture('scholar-profile.html')).replace(
      '<i>Example</i> &amp; test',
      'Emergence of Travelling Waves from a Synthetic Oscillatory Gene Network',
    ),
  );
  assert.equal(corrected.records[1].year, 2018);
});

test('Scholar parser rejects blocked, incomplete, malformed, and wrong-profile responses', async () => {
  const blocked = await fixture('scholar-blocked.html');
  assert.equal(isBlockedScholarResponse(blocked), true);
  assert.throws(() => parseScholarProfile(blocked));
  const valid = await fixture('scholar-profile.html');
  assert.throws(() =>
    parseScholarProfile(valid.replace('Articles 1&ndash;2', 'Articles 1&ndash;3')),
  );
  assert.throws(() => parseScholarProfile(valid.replaceAll('m3sQS9cAAAAJ', 'wrongProfile')));
  assert.throws(() => parseScholarProfile('<html><body>empty</body></html>'));
});

test('OpenAlex matching prefers DOI, supports normalized titles, and rejects ambiguity', () => {
  assert.equal(
    matchOpenAlexWork(publication({ doi: '10.1/ABC' }), [work({ doi: 'https://doi.org/10.1/abc' })])
      ?.id,
    'https://openalex.org/W1',
  );
  assert.equal(
    matchOpenAlexWork(publication({ title: 'Café: a study!' }), [work({ title: 'Cafe — a study' })])
      ?.id,
    'https://openalex.org/W1',
  );
  assert.equal(
    matchOpenAlexWork(publication(), [work(), work({ id: 'https://openalex.org/W2' })]),
    null,
  );
});

test('duplicate merging uses DOI or normalized title, keeps versions, and remaps edges', () => {
  const first = publication({
    id: 'first',
    doi: '10.1/example',
    scholarCitations: 4,
    versions: [
      {
        scholarId: 'first',
        scholarUrl: 'https://example.com/1',
        title: 'A publication',
        authors: ['G Vidal'],
        venue: 'Journal',
        year: 2024,
        citations: 4,
      },
    ],
  });
  const second = publication({
    id: 'second',
    doi: 'https://doi.org/10.1/EXAMPLE',
    scholarCitations: 9,
    versions: [
      {
        scholarId: 'second',
        scholarUrl: 'https://example.com/2',
        title: 'A publication',
        authors: ['G Vidal'],
        venue: 'Preprint',
        year: 2023,
        citations: 9,
      },
    ],
  });
  const merged = mergePublications([first, second]);
  assert.equal(merged.publications.length, 1);
  assert.equal(merged.publications[0].scholarCitations, 9);
  assert.equal(merged.publications[0].versions.length, 2);
  assert.deepEqual(
    remapCitationEdges(
      [
        { source: 'third', target: 'second' },
        { source: 'first', target: 'second' },
      ],
      new Map([...merged.idMap, ['third', 'third']]),
    ),
    [{ source: 'third', target: 'first' }],
  );
});

test('search, sorting, citation scaling, and chronological placement stay deterministic', () => {
  const items = [
    publication({ id: 'a', title: 'Beta', year: 2020, scholarCitations: 100 }),
    publication({
      id: 'b',
      title: 'Alpha',
      authors: ['Ada Lovelace'],
      venue: 'Conference',
      year: null,
      type: 'conference paper',
      scholarCitations: 0,
    }),
  ];
  assert.equal(normalizeTitle('Café & DNA'), 'cafe and dna');
  assert.deepEqual(
    filterPublications(items, 'Ada').map((item) => item.id),
    ['b'],
  );
  assert.deepEqual(
    sortPublications(items, 'newest').map((item) => item.id),
    ['a', 'b'],
  );
  assert.deepEqual(
    sortPublications(items, 'title').map((item) => item.id),
    ['b', 'a'],
  );
  assert.equal(citationRadius(0, 100), 7);
  assert.equal(citationRadius(100, 100), 22);
  assert.ok(citationRadius(10, 100) > 7 && citationRadius(10, 100) < 22);
  const points = placePublicationsChronologically(items, 500);
  assert.equal(points.length, 2);
  assert.ok(
    points.every(
      (point) => point.x >= 42 && point.x <= 458 && point.radius >= 7 && point.radius <= 22,
    ),
  );
});

test('BibTeX export includes stable metadata and escapes reserved characters', () => {
  const bibtex = publicationToBibtex(
    publication({
      title: 'Design & build',
      authors: ['Ada Lovelace', 'G Vidal', '...'],
      year: 2024,
      doi: '10.1/example_test',
    }),
  );
  assert.match(bibtex, /^@article\{lovelace2024design,/);
  assert.match(bibtex, /title = \{Design \\& build\}/);
  assert.match(bibtex, /author = \{Ada Lovelace and G Vidal\}/);
  assert.match(bibtex, /doi = \{10\.1\/example\\_test\}/);
});

test('checked-in snapshot and explorer markup expose resilient and accessible defaults', async () => {
  const snapshot: unknown = JSON.parse(
    await fs.readFile(new URL('../src/data/publications.generated.json', import.meta.url), 'utf8'),
  );
  assert.equal(isValidPublicationSnapshot(snapshot), true);
  assert.ok(isValidPublicationSnapshot(snapshot));
  const publicationIds = new Set(snapshot.publications.map(({ id }) => id));
  assert.equal(publicationIds.size, snapshot.publications.length);
  assert.equal(
    snapshot.publications.find(({ title }) => title.startsWith('Emergence of Travelling Waves'))
      ?.year,
    2018,
  );
  assert.equal(
    snapshot.publications.reduce((total, item) => total + item.versions.length, 0),
    snapshot.profile.sourceRecordCount,
  );
  assert.ok(
    snapshot.citationEdges.every(
      ({ source, target }) =>
        source !== target && publicationIds.has(source) && publicationIds.has(target),
    ),
  );
  const source = await fs.readFile(
    new URL('../src/pages/publications/index.astro', import.meta.url),
    'utf8',
  );
  assert.match(source, /aria-pressed="true">Table/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /role="img"/);
  assert.match(source, /type="application\/json"/);
  assert.match(source, /text-4xl font-bold tracking-tight text-slate-950/);
  assert.doesNotMatch(source, /id="graph-list"/);
  assert.doesNotMatch(source, /Citation metrics are Google Scholar estimates/);
  assert.match(source, /class="flip-digit"/);
  assert.match(source, /data-metric-value=/);
  assert.match(source, /data-target-digit=/);
  assert.match(source, /flip-static-top/);
  assert.match(source, /flip-static-bottom/);
  assert.match(source, /flip-front/);
  assert.match(source, /flip-back/);
  assert.match(source, /flip-leaf-forward/);
  assert.match(source, /playMetricAnimation/);
  assert.match(source, /aria-label="Replay metric animation"/);
  assert.doesNotMatch(source, /metric-card::before/);
  assert.doesNotMatch(source, /synchronized-metric/);
  assert.match(source, /data-copy-bibtex=/);
  assert.match(
    source,
    /<strong title=\{publication\.title\}>[\s\S]*?<a href=\{publication\.scholarUrl\}/,
  );
  assert.match(source, /publication\.doi && \(/);
  assert.doesNotMatch(source, />Scholar<\/a>/);
  assert.match(source, /<th>Venue<\/th><th>Type<\/th>/);
  assert.match(source, /<td data-label="Venue">/);
  assert.match(source, /<td data-label="Type">/);
});
