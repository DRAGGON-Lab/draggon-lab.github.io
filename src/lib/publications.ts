export type PublicationType =
  | 'journal article'
  | 'book chapter'
  | 'conference paper'
  | 'preprint'
  | 'thesis'
  | 'report'
  | 'other';

export interface PublicationVersion {
  scholarId: string;
  scholarUrl: string;
  title: string;
  authors: string[];
  venue: string;
  year: number | null;
  citations: number;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number | null;
  publicationDate: string | null;
  type: PublicationType;
  scholarCitations: number;
  scholarUrl: string;
  doi: string | null;
  openAlexId: string | null;
  versions: PublicationVersion[];
}

export interface CitationEdge {
  source: string;
  target: string;
}

export interface PublicationSnapshot {
  generatedAt: string;
  profile: {
    id: string;
    name: string;
    url: string;
    totalCitations: number;
    hIndex: number;
    i10Index: number;
    sourceRecordCount: number;
  };
  publications: Publication[];
  citationEdges: CitationEdge[];
}

export function isValidPublicationSnapshot(value: unknown): value is PublicationSnapshot {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PublicationSnapshot>;
  return (
    typeof candidate.generatedAt === 'string' &&
    !!candidate.profile &&
    candidate.profile.id === 'm3sQS9cAAAAJ' &&
    typeof candidate.profile.totalCitations === 'number' &&
    Array.isArray(candidate.publications) &&
    candidate.publications.length > 0 &&
    candidate.publications.every(
      (publication) =>
        typeof publication?.id === 'string' &&
        typeof publication?.title === 'string' &&
        typeof publication?.scholarCitations === 'number',
    ) &&
    Array.isArray(candidate.citationEdges)
  );
}

export type PublicationSort = 'newest' | 'oldest' | 'cited' | 'title';

function escapeBibtex(value: string): string {
  const replacements: Record<string, string> = {
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    '%': '\\%',
    $: '\\$',
    '#': '\\#',
    '&': '\\&',
    _: '\\_',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
  };
  return value.replace(/[\\{}%$#&_~^]/g, (character) => replacements[character]);
}

export function publicationToBibtex(publication: Publication): string {
  const entryType: Record<PublicationType, string> = {
    'journal article': 'article',
    'book chapter': 'incollection',
    'conference paper': 'inproceedings',
    preprint: 'misc',
    thesis: 'phdthesis',
    report: 'techreport',
    other: 'misc',
  };
  const firstAuthor = normalizeTitle(publication.authors[0] ?? 'publication')
    .split(' ')
    .at(-1);
  const firstTitleWord = normalizeTitle(publication.title).split(' ')[0] || 'work';
  const key = `${firstAuthor || 'publication'}${publication.year ?? 'nd'}${firstTitleWord}`;
  const authors = publication.authors.filter((author) => author !== '...').join(' and ');
  const fields: Array<[string, string | number | null]> = [
    ['title', publication.title],
    ['author', authors],
    [publication.type === 'journal article' ? 'journal' : 'booktitle', publication.venue],
    ['year', publication.year],
    ['doi', publication.doi],
    ['url', publication.scholarUrl],
  ];
  const renderedFields = fields
    .filter(([, value]) => value !== null && value !== '')
    .map(([name, value]) => `  ${name} = {${escapeBibtex(String(value))}}`)
    .join(',\n');
  return `@${entryType[publication.type]}{${key},\n${renderedFields}\n}`;
}

export function normalizeTitle(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function normalizeDoi(value: string | null | undefined): string | null {
  if (!value) return null;
  const doi = value
    .trim()
    .toLocaleLowerCase('en')
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '');
  return doi || null;
}

function publicationKey(publication: Pick<Publication, 'doi' | 'title'>): string {
  const doi = normalizeDoi(publication.doi);
  return doi ? `doi:${doi}` : `title:${normalizeTitle(publication.title)}`;
}

export function mergePublications(publications: Publication[]): {
  publications: Publication[];
  idMap: Map<string, string>;
} {
  const merged = new Map<string, Publication>();
  const idMap = new Map<string, string>();

  for (const publication of publications) {
    const titleKey = `title:${normalizeTitle(publication.title)}`;
    const doiKey = publicationKey(publication);
    const existing = merged.get(doiKey) ?? merged.get(titleKey);
    if (!existing) {
      const copy = { ...publication, versions: [...publication.versions] };
      merged.set(doiKey, copy);
      merged.set(titleKey, copy);
      idMap.set(publication.id, copy.id);
      continue;
    }

    idMap.set(publication.id, existing.id);
    existing.scholarCitations = Math.max(existing.scholarCitations, publication.scholarCitations);
    existing.doi ??= publication.doi;
    existing.openAlexId ??= publication.openAlexId;
    existing.publicationDate ??= publication.publicationDate;
    if (existing.year === null || (publication.year !== null && publication.year < existing.year)) {
      existing.year = publication.year;
    }
    existing.versions.push(...publication.versions);
    merged.set(doiKey, existing);
    merged.set(titleKey, existing);
  }

  return { publications: [...new Set(merged.values())], idMap };
}

export function remapCitationEdges(
  edges: CitationEdge[],
  idMap: Map<string, string>,
): CitationEdge[] {
  const unique = new Map<string, CitationEdge>();
  for (const edge of edges) {
    const source = idMap.get(edge.source) ?? edge.source;
    const target = idMap.get(edge.target) ?? edge.target;
    if (source === target) continue;
    unique.set(`${source}\u0000${target}`, { source, target });
  }
  return [...unique.values()];
}

export function filterPublications(publications: Publication[], query: string): Publication[] {
  const needle = normalizeTitle(query);
  if (!needle) return [...publications];
  return publications.filter((publication) =>
    normalizeTitle(
      [
        publication.title,
        publication.authors.join(' '),
        publication.venue,
        publication.year ?? '',
        publication.type,
      ].join(' '),
    ).includes(needle),
  );
}

export function sortPublications(
  publications: Publication[],
  order: PublicationSort,
): Publication[] {
  const byTitle = (a: Publication, b: Publication) => a.title.localeCompare(b.title);
  return [...publications].sort((a, b) => {
    if (order === 'title') return byTitle(a, b);
    if (order === 'cited') return b.scholarCitations - a.scholarCitations || byTitle(a, b);
    const aYear = a.year ?? (order === 'newest' ? -Infinity : Infinity);
    const bYear = b.year ?? (order === 'newest' ? -Infinity : Infinity);
    return (order === 'newest' ? bYear - aYear : aYear - bYear) || byTitle(a, b);
  });
}

export function citationRadius(citations: number, maximum = 81): number {
  const minRadius = 7;
  const maxRadius = 22;
  if (maximum <= 0 || citations <= 0) return minRadius;
  return Math.min(maxRadius, minRadius + (maxRadius - minRadius) * Math.sqrt(citations / maximum));
}

export interface TimelinePoint {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export function placePublicationsChronologically(
  publications: Publication[],
  width: number,
  newestFirst = false,
): TimelinePoint[] {
  const dated = (publication: Publication) => {
    if (publication.publicationDate) return Date.parse(publication.publicationDate);
    return publication.year === null ? Number.POSITIVE_INFINITY : Date.UTC(publication.year, 0, 1);
  };
  const ordered = [...publications].sort((a, b) => {
    const aMissing = a.publicationDate === null && a.year === null;
    const bMissing = b.publicationDate === null && b.year === null;
    if (aMissing !== bMissing) return aMissing ? 1 : -1;
    const comparison = dated(a) - dated(b) || a.title.localeCompare(b.title);
    return newestFirst ? -comparison : comparison;
  });
  const maximum = Math.max(0, ...ordered.map((publication) => publication.scholarCitations));
  const left = 42;
  const right = Math.max(left, width - 42);
  const span = Math.max(1, ordered.length - 1);
  return ordered.map((publication, index) => ({
    id: publication.id,
    x: left + ((right - left) * index) / span,
    y: 78 + (index % 3) * 62,
    radius: citationRadius(publication.scholarCitations, maximum),
  }));
}
