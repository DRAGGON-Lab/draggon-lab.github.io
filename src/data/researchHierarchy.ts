export const researchHierarchy = [
  { slug: 'biological-software-foundations', order: 1 },
  { slug: 'autonomous-laboratories', order: 2 },
  { slug: 'ai-aided-biodesign', order: 3 },
  { slug: 'digital-twins-living-systems', order: 4 },
  { slug: 'intelligent-genetic-genomic-networks', order: 5 },
] as const;

const hierarchyBySlug: ReadonlyMap<string, (typeof researchHierarchy)[number]> = new Map(
  researchHierarchy.map((item) => [item.slug, item]),
);

export function getResearchHierarchy(slug: string) {
  const item = hierarchyBySlug.get(slug);

  if (!item) {
    throw new Error(`Research entry "${slug}" is missing from the research hierarchy.`);
  }

  return item;
}

export function sortResearchByHierarchy<T extends { id: string; data: { title: string } }>(
  entries: T[],
) {
  return [...entries].sort((first, second) => {
    const firstHierarchy = getResearchHierarchy(first.id);
    const secondHierarchy = getResearchHierarchy(second.id);

    return (
      firstHierarchy.order - secondHierarchy.order ||
      first.data.title.localeCompare(second.data.title)
    );
  });
}
