import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

import {
  githubRepositoryEcosystemTags,
  githubRepositoryStageOverrides,
} from '../data/githubRepositoryConfig.ts';

export const githubOrganization = 'DRAGGON-Lab';
export const githubLinguistLanguagesUrl =
  'https://raw.githubusercontent.com/github-linguist/linguist/main/lib/linguist/languages.yml';

export type RepositoryDevelopmentStage =
  'planning' | 'pre-alpha' | 'alpha' | 'beta' | 'stable' | 'mature' | 'inactive';

export type RepositoryClassification = RepositoryDevelopmentStage | 'fork';
export type RepositoryEcosystemTag = 'Design' | 'Build' | 'Test' | 'Learn' | 'Infrastructure';

export type RepositoryLanguage = {
  name: string;
  percentage: number;
  color: string | null;
};

export type GitHubRepository = {
  name: string;
  url: string;
  description: string | null;
  classification: RepositoryClassification;
  ecosystemTags: RepositoryEcosystemTag[];
  updatedAt: string;
  languages: RepositoryLanguage[];
};

type GitHubRepositoryResponse = {
  name: string;
  html_url: string;
  description: string | null;
  archived: boolean;
  fork: boolean;
  updated_at: string;
  languages_url: string;
};

type FetchRepositoriesOptions = {
  fetchImpl?: typeof fetch;
  token?: string;
  ignoredNames?: ReadonlySet<string>;
  stageOverrides?: Readonly<Record<string, RepositoryDevelopmentStage>>;
  ecosystemTags?: Readonly<Record<string, readonly RepositoryEcosystemTag[]>>;
  languageColors?: Readonly<Record<string, string>>;
};

const ignoreFileName = '.github-repositories-ignore';

export function parseRepositoryIgnoreFile(contents: string): Set<string> {
  return new Set(
    contents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'))
      .map((line) => line.toLocaleLowerCase('en-US')),
  );
}

export async function loadRepositoryIgnoreFile(
  filePath = path.join(process.cwd(), ignoreFileName),
): Promise<Set<string>> {
  return parseRepositoryIgnoreFile(await fs.readFile(filePath, 'utf8'));
}

export function resolveRepositoryClassification(
  repository: Pick<GitHubRepositoryResponse, 'name' | 'archived' | 'fork'>,
  overrides: Readonly<Record<string, RepositoryDevelopmentStage>>,
): RepositoryClassification {
  const normalizedName = repository.name.toLocaleLowerCase('en-US');
  const override = Object.entries(overrides).find(
    ([name]) => name.toLocaleLowerCase('en-US') === normalizedName,
  )?.[1];

  if (repository.archived || override === 'inactive') return 'inactive';
  if (repository.fork) return 'fork';
  return override ?? 'alpha';
}

export function resolveRepositoryEcosystemTags(
  repositoryName: string,
  configuredTags: Readonly<Record<string, readonly RepositoryEcosystemTag[]>>,
): RepositoryEcosystemTag[] {
  const normalizedName = repositoryName.toLocaleLowerCase('en-US');
  return [
    ...(Object.entries(configuredTags).find(
      ([name]) => name.toLocaleLowerCase('en-US') === normalizedName,
    )?.[1] ?? []),
  ];
}

export function summarizeLanguages(
  languageBytes: Readonly<Record<string, number>>,
  languageColors: Readonly<Record<string, string>> = {},
) {
  const languages = Object.entries(languageBytes).filter(
    ([, bytes]) => Number.isFinite(bytes) && bytes > 0,
  );
  const totalBytes = languages.reduce((total, [, bytes]) => total + bytes, 0);
  if (totalBytes === 0) return [];

  return languages
    .toSorted(([firstName, firstBytes], [secondName, secondBytes]) => {
      return secondBytes - firstBytes || firstName.localeCompare(secondName);
    })
    .map(([name, bytes]) => ({
      name,
      percentage: Math.round((bytes / totalBytes) * 1000) / 10,
      color: languageColors[name] ?? null,
    }));
}

export function parseGitHubLanguageColors(contents: string): Record<string, string> {
  const languages = parse(contents) as unknown;
  if (typeof languages !== 'object' || languages === null || Array.isArray(languages)) {
    throw new Error('GitHub Linguist returned malformed language color data.');
  }

  const colors: Record<string, string> = {};
  for (const [name, definition] of Object.entries(languages)) {
    if (typeof definition !== 'object' || definition === null || Array.isArray(definition))
      continue;
    const color = (definition as { color?: unknown }).color;
    if (typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)) colors[name] = color;
  }
  return colors;
}

function githubHeaders(token?: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'draggon-lab.github.io',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchJson(fetchImpl: typeof fetch, url: string, token?: string): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers: githubHeaders(token),
  });

  if (!response.ok) {
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitDetail = rateLimitRemaining === '0' ? ' GitHub API rate limit exhausted.' : '';
    throw new Error(
      `GitHub API request failed (${response.status} ${response.statusText}) for ${url}.${rateLimitDetail}`,
    );
  }

  return response.json();
}

async function fetchGitHubLanguageColors(fetchImpl: typeof fetch) {
  const response = await fetchImpl(githubLinguistLanguagesUrl, {
    headers: { 'User-Agent': 'draggon-lab.github.io' },
  });
  if (!response.ok) {
    throw new Error(
      `GitHub Linguist request failed (${response.status} ${response.statusText}) for ${githubLinguistLanguagesUrl}.`,
    );
  }
  return parseGitHubLanguageColors(await response.text());
}

function isRepositoryResponse(value: unknown): value is GitHubRepositoryResponse {
  if (typeof value !== 'object' || value === null) return false;
  const repository = value as Partial<GitHubRepositoryResponse>;
  return (
    typeof repository.name === 'string' &&
    typeof repository.html_url === 'string' &&
    (typeof repository.description === 'string' || repository.description === null) &&
    typeof repository.archived === 'boolean' &&
    typeof repository.fork === 'boolean' &&
    typeof repository.updated_at === 'string' &&
    typeof repository.languages_url === 'string'
  );
}

function isLanguageResponse(value: unknown): value is Record<string, number> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((bytes) => typeof bytes === 'number')
  );
}

async function fetchRepositoryPages(fetchImpl: typeof fetch, token?: string) {
  const repositories: GitHubRepositoryResponse[] = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/orgs/${githubOrganization}/repos?type=public&sort=updated&direction=desc&per_page=100&page=${page}`;
    const response = await fetchJson(fetchImpl, url, token);
    if (!Array.isArray(response) || !response.every(isRepositoryResponse)) {
      throw new Error(`GitHub API returned malformed repository data for page ${page}.`);
    }

    repositories.push(...response);
    if (response.length < 100) return repositories;
    page += 1;
  }
}

export async function fetchGitHubRepositories(
  options: FetchRepositoriesOptions = {},
): Promise<GitHubRepository[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const token = options.token ?? process.env.GITHUB_TOKEN;
  const ignoredNames = options.ignoredNames ?? (await loadRepositoryIgnoreFile());
  const stageOverrides = options.stageOverrides ?? githubRepositoryStageOverrides;
  const ecosystemTags = options.ecosystemTags ?? githubRepositoryEcosystemTags;
  const [repositoryResponses, languageColors] = await Promise.all([
    fetchRepositoryPages(fetchImpl, token),
    options.languageColors
      ? Promise.resolve(options.languageColors)
      : fetchGitHubLanguageColors(fetchImpl),
  ]);
  const repositories = repositoryResponses.filter(
    (repository) => !ignoredNames.has(repository.name.toLocaleLowerCase('en-US')),
  );

  const hydratedRepositories = await Promise.all(
    repositories.map(async (repository): Promise<GitHubRepository> => {
      const languageResponse = await fetchJson(fetchImpl, repository.languages_url, token);
      if (!isLanguageResponse(languageResponse)) {
        throw new Error(`GitHub API returned malformed language data for ${repository.name}.`);
      }

      return {
        name: repository.name,
        url: repository.html_url,
        description: repository.description,
        classification: resolveRepositoryClassification(repository, stageOverrides),
        ecosystemTags: resolveRepositoryEcosystemTags(repository.name, ecosystemTags),
        updatedAt: repository.updated_at,
        languages: summarizeLanguages(languageResponse, languageColors),
      };
    }),
  );

  return hydratedRepositories.toSorted((first, second) => {
    return (
      Date.parse(second.updatedAt) - Date.parse(first.updatedAt) ||
      first.name.localeCompare(second.name)
    );
  });
}
