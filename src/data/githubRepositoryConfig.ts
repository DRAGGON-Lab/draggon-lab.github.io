import type {
  RepositoryDevelopmentStage,
  RepositoryEcosystemTag,
} from '../lib/githubRepositories.ts';

/**
 * Optional editorial stage overrides for GitHub repositories.
 *
 * Keys are repository names (matching is case-insensitive). Repositories that
 * are archived on GitHub always display as inactive, and forks display as
 * forks. All other repositories default to alpha when they do not have an
 * override here. Stages follow PyPI's Development Status taxonomy.
 */
export const githubRepositoryStageOverrides: Record<string, RepositoryDevelopmentStage> = {};

/**
 * Editorial placement of each repository in the design-build-test-learn cycle.
 * Infrastructure identifies shared platforms, standards, data layers, APIs,
 * environments, and inventory systems that support more than one DBTL phase.
 */
export const githubRepositoryEcosystemTags: Record<string, readonly RepositoryEcosystemTag[]> = {
  SimBOL: ['Design', 'Learn'],
  'ATCG-FM': ['Learn', 'Infrastructure'],
  CellModeller2: ['Design', 'Learn'],
  LOICA: ['Design'],
  Tricahue: ['Test', 'Learn', 'Infrastructure'],
  SBOLInventory: ['Build', 'Infrastructure'],
  'Excel-to-Flapjack': ['Test', 'Infrastructure'],
  GG: ['Design'],
  dnaplotlib: ['Design', 'Infrastructure'],
  'GC-AI-environment': ['Learn', 'Infrastructure'],
  pyFlapjack: ['Test', 'Learn', 'Infrastructure'],
  EngBioLearning: ['Learn', 'Infrastructure'],
  'Excel-to-SBOL': ['Design', 'Infrastructure'],
  AoGuang: ['Design', 'Learn'],
  WebCM: ['Design', 'Learn'],
  flapjack_fullstack: ['Test', 'Learn', 'Infrastructure'],
  SynBioInventory: ['Build', 'Infrastructure'],
  Ouroboros: ['Design', 'Learn'],
  KaiTen: ['Design', 'Learn'],
  LADON: ['Learn'],
};
