type DraftableEntry = {
  data: {
    draft?: boolean;
    title: string;
  };
};

const deployEnvironment = import.meta.env.PUBLIC_DEPLOY_ENV ?? 'development';
const isProduction = deployEnvironment === 'production';

export function includeEntryInEnvironment<T extends DraftableEntry>(entry: T) {
  return !isProduction || !entry.data.draft;
}

export function sortEntriesByTitle<T extends DraftableEntry>(entries: T[]) {
  return entries.toSorted((first, second) => first.data.title.localeCompare(second.data.title));
}
