import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const nodeTypes = [
  'research',
  'tool',
  'publication',
  'lab-note',
  'teaching-resource',
  'teaching-module',
  'workflow',
  'dataset',
  'project-direction',
  'person',
] as const;

const relationships = [
  'supports',
  'uses',
  'describes',
  'authored_by',
  'related_to',
  'cites',
  'produces',
  'teaches',
  'enables',
] as const;

const contentRefPattern =
  /^(research|tool|publication|lab-note|teaching-resource|teaching-module|workflow|dataset|project-direction|person):[a-z0-9][a-z0-9/-]*$/;
const slugPattern = /^[a-z0-9][a-z0-9/-]*$/;
const absoluteOrRootRelativeUrl = z.string().refine(
  (value) => {
    if (value.startsWith('/')) return true;
    return URL.canParse(value);
  },
  { message: 'Expected an absolute URL or a root-relative path.' },
);

const contentReference = z.string().regex(contentRefPattern, {
  message: 'Expected a graph reference like "research:ai-aided-biodesign".',
});

const graphEdge = z.object({
  target: contentReference,
  relationship: z.enum(relationships).optional(),
  label: z.string().min(1).optional(),
  draft: z.boolean().optional(),
});

const graphEdges = z.array(z.union([contentReference, graphEdge])).default([]);

const link = z.object({
  label: z.string().min(1),
  url: absoluteOrRootRelativeUrl,
  primary: z.boolean().default(false),
  kind: z
    .enum([
      'website',
      'paper',
      'preprint',
      'doi',
      'repository',
      'documentation',
      'dataset',
      'download',
      'slides',
      'video',
      'notebook',
      'exercise',
      'artifact',
      'profile',
      'other',
    ])
    .default('website'),
  description: z.string().optional(),
});

const citation = z.object({
  text: z.string().min(1),
  doi: z.string().min(1).optional(),
  url: absoluteOrRootRelativeUrl.optional(),
});

const common = z.object({
  id: contentReference.optional(),
  slug: z.string().regex(slugPattern).optional(),
  graph_type: z.enum(nodeTypes).optional(),
  title: z.string().min(1),
  summary: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(false),
  language: z.string().min(2).default('en'),
  href: absoluteOrRootRelativeUrl.optional(),
  references: graphEdges,
  relationships: graphEdges,
  related: graphEdges,
  related_to: graphEdges,
  supports: graphEdges,
  uses: graphEdges,
  describes: graphEdges,
  cites: graphEdges,
  produces: graphEdges,
  teaches: graphEdges,
  enables: graphEdges,
  authored_by: graphEdges,
});

const publication = common.extend({
  graph_type: z.literal('publication').optional(),
  authors: z.array(z.string().min(1)).min(1).optional(),
  author_refs: z.array(contentReference).default([]),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getUTCFullYear() + 1)
    .optional(),
  venue: z.string().min(1).optional(),
  publication_type: z
    .enum([
      'journal-article',
      'conference-paper',
      'preprint',
      'thesis',
      'book-chapter',
      'report',
      'other',
    ])
    .optional(),
  doi: z.string().min(1).optional(),
  url: absoluteOrRootRelativeUrl.optional(),
  pdf_url: absoluteOrRootRelativeUrl.optional(),
  code_url: absoluteOrRootRelativeUrl.optional(),
  dataset_refs: z.array(contentReference).default([]),
});

const teachingResource = common
  .extend({
    graph_type: z.literal('teaching-resource').optional(),
    links: z.array(link).min(1),
    has_detail_page: z.boolean().default(false),
    learning_outcomes: z.array(z.string().min(1)).default([]),
    prerequisites: z.array(z.string().min(1)).default([]),
    estimated_time: z.string().min(1).optional(),
    artifact_links: z.array(link).default([]),
    citation: citation.optional(),
    license_note: z.string().min(1).optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    resource_type: z
      .enum([
        'lecture',
        'tutorial',
        'workshop',
        'exercise',
        'notebook',
        'slides',
        'video',
        'assessment',
        'other',
      ])
      .optional(),
  })
  .superRefine((data, context) => {
    const primaryLinks = data.links.filter((item) => item.primary);
    if (primaryLinks.length !== 1) {
      context.addIssue({
        code: 'custom',
        path: ['links'],
        message: 'Teaching resources require exactly one primary link.',
      });
    }
    if (data.has_detail_page) {
      if (data.learning_outcomes.length === 0) {
        context.addIssue({
          code: 'custom',
          path: ['learning_outcomes'],
          message: 'Detail pages require at least one learning outcome.',
        });
      }
      if (data.prerequisites.length === 0) {
        context.addIssue({
          code: 'custom',
          path: ['prerequisites'],
          message: 'Detail pages require prerequisites; use "No prerequisites" when applicable.',
        });
      }
      if (!data.estimated_time) {
        context.addIssue({
          code: 'custom',
          path: ['estimated_time'],
          message: 'Detail pages require estimated_time.',
        });
      }
      if (data.artifact_links.length === 0) {
        context.addIssue({
          code: 'custom',
          path: ['artifact_links'],
          message: 'Detail pages require at least one artifact link.',
        });
      }
    }
  });

const ecosystemItem = common.extend({
  ecosystem_group: z
    .enum(['design', 'build', 'test', 'learn', 'infrastructure', 'data', 'workflow'])
    .optional(),
  lifecycle_stage: z.enum(['design', 'build', 'test', 'learn', 'deploy', 'reuse']).optional(),
  status: z.enum(['active', 'prototype', 'archived', 'planned']).optional(),
  repository_url: absoluteOrRootRelativeUrl.optional(),
  documentation_url: absoluteOrRootRelativeUrl.optional(),
  project_url: absoluteOrRootRelativeUrl.optional(),
  tool_refs: z.array(contentReference).default([]),
  workflow_refs: z.array(contentReference).default([]),
  dataset_refs: z.array(contentReference).default([]),
});

const tool = ecosystemItem.extend({ graph_type: z.literal('tool').optional() });
const workflow = ecosystemItem.extend({
  graph_type: z.literal('workflow').optional(),
  inputs: z.array(contentReference).default([]),
  outputs: z.array(contentReference).default([]),
});
const dataset = ecosystemItem.extend({
  graph_type: z.literal('dataset').optional(),
  schema_url: absoluteOrRootRelativeUrl.optional(),
  license: z.string().min(1).optional(),
  citation: citation.optional(),
});

const person = common.extend({
  graph_type: z.literal('person').optional(),
  given_name: z.string().min(1).optional(),
  family_name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  affiliation: z.string().min(1).optional(),
  profile_links: z.array(link).default([]),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .optional(),
  orcid: z
    .string()
    .regex(/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/)
    .optional(),
});

const teachingModule = common.extend({
  graph_type: z.literal('teaching-module').optional(),
  resources: z.array(contentReference).default([]),
  learning_outcomes: z.array(z.string().min(1)).default([]),
  prerequisites: z.array(z.string().min(1)).default([]),
  estimated_time: z.string().min(1).optional(),
});

const collection = <Schema extends z.ZodTypeAny>(directory: string, schema: Schema) =>
  defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: `./src/content/${directory}` }),
    schema,
  });

export const collections = {
  research: collection('research', common.extend({ graph_type: z.literal('research').optional() })),
  tools: collection('tools', tool),
  publications: collection('publications', publication),
  'lab-notes': collection(
    'lab-notes',
    common.extend({ graph_type: z.literal('lab-note').optional() }),
  ),
  'teaching-modules': collection('teaching-modules', teachingModule),
  'teaching-resources': collection('teaching-resources', teachingResource),
  people: collection('people', person),
  'project-directions': collection(
    'project-directions',
    common.extend({ graph_type: z.literal('project-direction').optional() }),
  ),
  workflows: collection('workflows', workflow),
  datasets: collection('datasets', dataset),
};
