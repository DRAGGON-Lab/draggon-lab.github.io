import assert from 'node:assert/strict';
import test from 'node:test';

import {
  fetchGitHubRepositories,
  parseGitHubLanguageColors,
  parseRepositoryIgnoreFile,
  resolveRepositoryClassification,
  resolveRepositoryEcosystemTags,
  summarizeLanguages,
} from '../src/lib/githubRepositories.ts';

function repositoryResponse(
  name: string,
  options: {
    archived?: boolean;
    fork?: boolean;
    updatedAt?: string;
    description?: string | null;
  } = {},
) {
  return {
    name,
    html_url: `https://github.com/DRAGGON-Lab/${name}`,
    description: 'description' in options ? (options.description ?? null) : `${name} description`,
    archived: options.archived ?? false,
    fork: options.fork ?? false,
    updated_at: options.updatedAt ?? '2026-01-01T00:00:00Z',
    languages_url: `https://api.github.com/repos/DRAGGON-Lab/${name}/languages`,
  };
}

test('ignore files support comments, blank lines, and case-insensitive names', () => {
  const ignored = parseRepositoryIgnoreFile(`
    # Site plumbing
    .github

    DRAGGON-LAB.GITHUB.IO
  `);

  assert.deepEqual([...ignored], ['.github', 'draggon-lab.github.io']);
});

test('ecosystem tags are resolved case-insensitively without mutating configuration', () => {
  const configuredTags = { SimBOL: ['Design', 'Learn'] as const };
  const resolvedTags = resolveRepositoryEcosystemTags('simbol', configuredTags);

  assert.deepEqual(resolvedTags, ['Design', 'Learn']);
  resolvedTags.push('Infrastructure');
  assert.deepEqual(configuredTags.SimBOL, ['Design', 'Learn']);
  assert.deepEqual(resolveRepositoryEcosystemTags('unclassified', configuredTags), []);
});

test('classification uses maturity overrides with inactive and fork precedence', () => {
  const overrides = { SimBOL: 'beta' as const, dormant: 'inactive' as const };

  assert.equal(
    resolveRepositoryClassification({ name: 'simbol', archived: false, fork: false }, overrides),
    'beta',
  );
  assert.equal(
    resolveRepositoryClassification(
      { name: 'new-repository', archived: false, fork: false },
      overrides,
    ),
    'alpha',
  );
  assert.equal(
    resolveRepositoryClassification({ name: 'upstream', archived: false, fork: true }, overrides),
    'fork',
  );
  assert.equal(
    resolveRepositoryClassification({ name: 'dormant', archived: false, fork: true }, overrides),
    'inactive',
  );
  assert.equal(
    resolveRepositoryClassification({ name: 'retired', archived: true, fork: true }, overrides),
    'inactive',
  );
});

test('language summaries retain every language with GitHub colors and total-byte percentages', () => {
  assert.deepEqual(
    summarizeLanguages(
      { Python: 600, TypeScript: 250, CSS: 100, HTML: 40, Shell: 10 },
      { Python: '#3572A5', TypeScript: '#3178c6', CSS: '#663399' },
    ),
    [
      { name: 'Python', percentage: 60, color: '#3572A5' },
      { name: 'TypeScript', percentage: 25, color: '#3178c6' },
      { name: 'CSS', percentage: 10, color: '#663399' },
      { name: 'HTML', percentage: 4, color: null },
      { name: 'Shell', percentage: 1, color: null },
    ],
  );
  assert.deepEqual(summarizeLanguages({}), []);
});

test('GitHub Linguist YAML is reduced to valid canonical language colors', () => {
  assert.deepEqual(
    parseGitHubLanguageColors(`
Python:
  type: programming
  color: "#3572A5"
Text:
  type: prose
Invalid:
  color: red
`),
    { Python: '#3572A5' },
  );
});

test('repositories are filtered, hydrated, authenticated, and ordered by recent updates', async () => {
  const requestedUrls: string[] = [];
  const authorizationHeaders: Array<string | null> = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    requestedUrls.push(url);
    authorizationHeaders.push(new Headers(init?.headers).get('authorization'));

    if (url.includes('/orgs/')) {
      return Response.json([
        repositoryResponse('older', { updatedAt: '2026-01-01T00:00:00Z' }),
        repositoryResponse('ignored', { updatedAt: '2026-03-01T00:00:00Z' }),
        repositoryResponse('newer', {
          updatedAt: '2026-02-01T00:00:00Z',
          description: null,
        }),
      ]);
    }
    if (url.includes('/newer/')) return Response.json({ TypeScript: 75, CSS: 25 });
    if (url.includes('/older/')) return Response.json({ Python: 100 });
    return new Response('Unexpected request', { status: 500 });
  }) as typeof fetch;

  const repositories = await fetchGitHubRepositories({
    fetchImpl,
    token: 'test-token',
    ignoredNames: new Set(['ignored']),
    stageOverrides: { newer: 'beta' },
    ecosystemTags: { newer: ['Design'], older: ['Infrastructure'] },
    languageColors: { TypeScript: '#3178c6', CSS: '#663399', Python: '#3572A5' },
  });

  assert.deepEqual(
    repositories.map(({ name, classification, description, ecosystemTags }) => ({
      name,
      classification,
      description,
      ecosystemTags,
    })),
    [
      {
        name: 'newer',
        classification: 'beta',
        description: null,
        ecosystemTags: ['Design'],
      },
      {
        name: 'older',
        classification: 'alpha',
        description: 'older description',
        ecosystemTags: ['Infrastructure'],
      },
    ],
  );
  assert.equal(
    requestedUrls.some((url) => url.includes('/ignored/languages')),
    false,
  );
  assert.equal(
    authorizationHeaders.every((header) => header === 'Bearer test-token'),
    true,
  );
});

test('repository fetching follows pagination until a partial page', async () => {
  const firstPage = Array.from({ length: 100 }, (_, index) => repositoryResponse(`repo-${index}`));
  const fetchImpl = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/orgs/') && url.includes('&page=1')) return Response.json(firstPage);
    if (url.includes('/orgs/') && url.includes('&page=2')) {
      return Response.json([repositoryResponse('last-repo')]);
    }
    if (url.endsWith('/languages')) return Response.json({});
    return new Response('Unexpected request', { status: 500 });
  }) as typeof fetch;

  const repositories = await fetchGitHubRepositories({
    fetchImpl,
    ignoredNames: new Set(),
    stageOverrides: {},
    ecosystemTags: {},
    languageColors: {},
  });

  assert.equal(repositories.length, 101);
  assert.equal(
    repositories.some((repository) => repository.name === 'last-repo'),
    true,
  );
});

test('GitHub API failures include actionable status and rate-limit context', async () => {
  const fetchImpl = (async () =>
    new Response('Rate limited', {
      status: 403,
      statusText: 'Forbidden',
      headers: { 'x-ratelimit-remaining': '0' },
    })) as typeof fetch;

  await assert.rejects(
    fetchGitHubRepositories({
      fetchImpl,
      ignoredNames: new Set(),
      stageOverrides: {},
      ecosystemTags: {},
      languageColors: {},
    }),
    /403 Forbidden.*rate limit exhausted/i,
  );
});
