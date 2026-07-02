import { defineCollection, z } from 'astro:content';

const common = z.object({
  title: z.string(),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  language: z.string().default('en')
});

export const collections = {
  research: defineCollection({ schema: common }),
  tools: defineCollection({ schema: common }),
  publications: defineCollection({ schema: common }),
  'lab-notes': defineCollection({ schema: common }),
  'teaching-modules': defineCollection({ schema: common }),
  'teaching-resources': defineCollection({ schema: common }),
  people: defineCollection({ schema: common }),
  'project-directions': defineCollection({ schema: common }),
  workflows: defineCollection({ schema: common }),
  datasets: defineCollection({ schema: common })
};
