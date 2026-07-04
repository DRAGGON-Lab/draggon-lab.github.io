import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const common = z.object({
  title: z.string(),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  language: z.string().default('en'),
  href: z.string().optional(),
});

const contentCollection = (directory: string) =>
  defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: `./src/content/${directory}` }),
    schema: common,
  });

export const collections = {
  research: contentCollection('research'),
  tools: contentCollection('tools'),
  publications: contentCollection('publications'),
  'lab-notes': contentCollection('lab-notes'),
  'teaching-modules': contentCollection('teaching-modules'),
  'teaching-resources': contentCollection('teaching-resources'),
  people: contentCollection('people'),
  'project-directions': contentCollection('project-directions'),
  workflows: contentCollection('workflows'),
  datasets: contentCollection('datasets'),
};
