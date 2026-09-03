import {
  mergePublications,
  normalizeDoi,
  normalizeTitle,
  remapCitationEdges,
  type CitationEdge,
  type Publication,
  type PublicationSnapshot,
  type PublicationType,
} from './publications.ts';

const SCHOLAR_ORIGIN = 'https://scholar.google.com';
const PROFILE_ID = 'm3sQS9cAAAAJ';
const PROFILE_YEAR_OVERRIDES = new Map([
  [normalizeTitle('Emergence of Travelling Waves from a Synthetic Oscillatory Gene Network'), 2018],
]);

export interface ScholarProfile {
  name: string;
  totalCitations: number;
  hIndex: number;
  i10Index: number;
  records: Publication[];
}

export interface OpenAlexWork {
  id: string;
  doi: string | null;
  title: string;
  publication_date: string | null;
  type: string;
  referenced_works: string[];
}

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
      if (code[0] !== '#') return named[code.toLocaleLowerCase('en')] ?? entity;
      const number =
        code[1].toLocaleLowerCase('en') === 'x'
          ? Number.parseInt(code.slice(2), 16)
          : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function inferType(venue: string, title: string, openAlexType?: string): PublicationType {
  const value = `${openAlexType ?? ''} ${venue} ${title}`.toLocaleLowerCase('en');
  if (value.includes('dissertation') || value.includes('thesis')) return 'thesis';
  if (value.includes('book-chapter') || value.includes('methods and protocols'))
    return 'book chapter';
  if (value.includes('proceedings') || value.includes('conference') || value.includes('workshop')) {
    return 'conference paper';
  }
  if (value.includes('posted-content') || value.includes('biorxiv') || value.includes('preprint')) {
    return 'preprint';
  }
  if (value.includes('report')) return 'report';
  if (value.includes('article') || /journal|biology|pharmacology/.test(value)) {
    return 'journal article';
  }
  return 'other';
}

export function isBlockedScholarResponse(html: string): boolean {
  return (
    /unusual traffic|not a robot|captcha/i.test(html) ||
    !html.includes('id="gsc_prf_in"') ||
    !html.includes('class="gsc_a_tr"')
  );
}

export function parseScholarProfile(html: string): ScholarProfile {
  if (isBlockedScholarResponse(html))
    throw new Error('Scholar returned a blocked or malformed page.');
  if (!html.includes(`user=${PROFILE_ID}`) && !html.includes(`user%3D${PROFILE_ID}`)) {
    throw new Error('Scholar returned a different profile.');
  }

  const name = decodeHtml(html.match(/<div id="gsc_prf_in"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '');
  const metricValues = [...html.matchAll(/<td class="gsc_rsb_std">([\d,]+)<\/td>/g)].map((match) =>
    Number(match[1].replaceAll(',', '')),
  );
  const rowHtml = [...html.matchAll(/<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g)];
  const declaredCount = Number(html.match(/id="gsc_a_nn">Articles 1(?:&ndash;|–)(\d+)/)?.[1]);
  if (
    !name ||
    metricValues.length < 5 ||
    rowHtml.length === 0 ||
    rowHtml.length > 100 ||
    !Number.isFinite(declaredCount) ||
    declaredCount !== rowHtml.length
  ) {
    throw new Error('Scholar profile validation failed.');
  }

  const records = rowHtml.map((rowMatch): Publication => {
    const row = rowMatch[1];
    const titleMatch = row.match(/<a\s+([^>]*\bclass="gsc_a_at"[^>]*)>([\s\S]*?)<\/a\s*>/);
    const details = [...row.matchAll(/<div class="gs_gray">([\s\S]*?)<\/div>/g)];
    const yearText = row.match(/class="gsc_a_h gsc_a_hc gs_ibl">(\d{4})?<\/span>/)?.[1];
    const citationsText = row.match(/class="gsc_a_ac gs_ibl">(\d*)<\/a>/)?.[1];
    const href = titleMatch?.[1].match(/\bhref="([^"]+)"/)?.[1];
    if (!titleMatch || !href || details.length < 2) {
      throw new Error('Scholar publication row is malformed.');
    }

    const relativeUrl = decodeHtml(href);
    const scholarUrl = new URL(relativeUrl, SCHOLAR_ORIGIN).toString();
    const scholarId = new URL(scholarUrl).searchParams.get('citation_for_view') ?? relativeUrl;
    const title = decodeHtml(titleMatch[2]);
    const authors = decodeHtml(details[0][1]).split(/,\s*/).filter(Boolean);
    const venue = decodeHtml(details[1][1]).replace(/,\s*\d{4}$/, '');
    const year =
      PROFILE_YEAR_OVERRIDES.get(normalizeTitle(title)) ?? (yearText ? Number(yearText) : null);
    const scholarCitations = citationsText ? Number(citationsText) : 0;
    return {
      id: `scholar:${scholarId.split(':').at(-1)}`,
      title,
      authors,
      venue,
      year,
      publicationDate: year ? `${year}-01-01` : null,
      type: inferType(venue, title),
      scholarCitations,
      scholarUrl,
      doi: null,
      openAlexId: null,
      versions: [
        { scholarId, scholarUrl, title, authors, venue, year, citations: scholarCitations },
      ],
    };
  });

  return {
    name,
    totalCitations: metricValues[0],
    hIndex: metricValues[2],
    i10Index: metricValues[4],
    records,
  };
}

export function matchOpenAlexWork(
  publication: Pick<Publication, 'doi' | 'title'>,
  candidates: OpenAlexWork[],
): OpenAlexWork | null {
  const doi = normalizeDoi(publication.doi);
  if (doi) {
    const doiMatches = candidates.filter((candidate) => normalizeDoi(candidate.doi) === doi);
    if (doiMatches.length === 1) return doiMatches[0];
    if (doiMatches.length > 1) return null;
  }
  const title = normalizeTitle(publication.title);
  const titleMatches = candidates.filter((candidate) => normalizeTitle(candidate.title) === title);
  return titleMatches.length === 1 ? titleMatches[0] : null;
}

async function fetchOpenAlexCandidates(
  title: string,
  fetchImpl: typeof fetch,
): Promise<OpenAlexWork[]> {
  const url = new URL('https://api.openalex.org/works');
  url.searchParams.set('search', title);
  url.searchParams.set('per-page', '5');
  url.searchParams.set('select', 'id,doi,title,publication_date,type,referenced_works');
  url.searchParams.set('mailto', 'draggon-lab@colorado.edu');
  const response = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`OpenAlex request failed (${response.status}).`);
  const payload = (await response.json()) as { results?: OpenAlexWork[] };
  return Array.isArray(payload.results) ? payload.results : [];
}

export async function buildPublicationSnapshot(options: {
  scholarHtml: string;
  fetchImpl?: typeof fetch;
  generatedAt?: string;
}): Promise<PublicationSnapshot> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const profile = parseScholarProfile(options.scholarHtml);
  const enriched: Publication[] = [];
  const referencesById = new Map<string, string[]>();

  for (const publication of profile.records) {
    const candidates = await fetchOpenAlexCandidates(publication.title, fetchImpl);
    const match = matchOpenAlexWork(publication, candidates);
    const updated: Publication = match
      ? {
          ...publication,
          doi: normalizeDoi(match.doi),
          openAlexId: match.id,
          publicationDate: match.publication_date ?? publication.publicationDate,
          type: inferType(publication.venue, publication.title, match.type),
        }
      : publication;
    enriched.push(updated);
    if (match) referencesById.set(updated.id, match.referenced_works ?? []);
  }

  const { publications, idMap } = mergePublications(enriched);
  const publicationByOpenAlexId = new Map<string, string>();
  for (const publication of enriched) {
    if (publication.openAlexId) {
      publicationByOpenAlexId.set(
        publication.openAlexId,
        idMap.get(publication.id) ?? publication.id,
      );
    }
  }
  const rawEdges: CitationEdge[] = [];
  for (const [sourceId, references] of referencesById) {
    for (const reference of references) {
      const target = publicationByOpenAlexId.get(reference);
      if (target) rawEdges.push({ source: sourceId, target });
    }
  }

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    profile: {
      id: PROFILE_ID,
      name: profile.name,
      url: `${SCHOLAR_ORIGIN}/citations?user=${PROFILE_ID}&hl=en`,
      totalCitations: profile.totalCitations,
      hIndex: profile.hIndex,
      i10Index: profile.i10Index,
      sourceRecordCount: profile.records.length,
    },
    publications,
    citationEdges: remapCitationEdges(rawEdges, idMap),
  };
}
