import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const CONTENT_MODEL_PATH = path.join(process.cwd(), 'docs/content-model.md');
const SITE_GRAPH_ROUTE_PATH = path.join(process.cwd(), 'src/pages/site-graph.json.ts');
const VALID_ENVS = ['production', 'preview', 'development'] as const;
type DeployEnv = (typeof VALID_ENVS)[number];

type Severity = 'error' | 'warning';
type GraphNode = { id: string; slug: string; type: string; title: string; draft: boolean; filePath: string; source: string };
type GraphEdge = { source: string; target: string; relationship: string; field: string; filePath: string; draft?: boolean };
type Diagnostic = { code: string; severity: Severity; message: string; filePath: string; field: string; target?: string; fix: string };

type FrontmatterValue = string | boolean | string[] | Record<string, unknown> | Array<Record<string, unknown>> | undefined;

const deployEnv = process.env.PUBLIC_DEPLOY_ENV ?? 'development';
const diagnostics: Diagnostic[] = [];

function addDiagnostic(diagnostic: Diagnostic) {
  diagnostics.push(diagnostic);
}

function formatDiagnostic(diagnostic: Diagnostic) {
  const target = diagnostic.target ? `\n  target: ${diagnostic.target}` : '';
  return `[${diagnostic.code}] ${diagnostic.severity.toUpperCase()}: ${diagnostic.message}\n  file: ${diagnostic.filePath}\n  field: ${diagnostic.field}${target}\n  suggested fix: ${diagnostic.fix}`;
}

function relative(filePath: string) {
  return path.relative(process.cwd(), filePath).replaceAll(path.sep, '/');
}

function defaultRelationship(field: string) {
  const aliases: Record<string, string> = {
    references: 'related_to',
    relationships: 'related_to',
    related: 'related_to'
  };
  return aliases[field] ?? field;
}

function singularType(collection: string) {
  const map: Record<string, string> = {
    research: 'research',
    tools: 'tool',
    publications: 'publication',
    'lab-notes': 'lab-note',
    'teaching-resources': 'teaching-resource',
    'teaching-modules': 'teaching-module',
    workflows: 'workflow',
    datasets: 'dataset',
    people: 'person',
    'project-directions': 'project-direction'
  };
  return map[collection] ?? collection.replace(/s$/, '');
}

async function parseAllowedLists() {
  const model = await readFile(CONTENT_MODEL_PATH, 'utf8');
  const nodeMatch = model.match(/Allowed node types:\s*([^\n]+)/);
  const relationshipMatch = model.match(/Allowed relationships:\s*([^\n]+)/);
  if (!nodeMatch || !relationshipMatch) throw new Error('Unable to read allowed graph lists from docs/content-model.md.');
  const split = (value: string) => new Set(value.split(',').map((item) => item.trim().replace(/\.$/, '')).filter(Boolean));
  return { allowedNodeTypes: split(nodeMatch[1]), allowedRelationships: split(relationshipMatch[1]) };
}

function parseScalar(value: string): FrontmatterValue {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  }
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function parseFrontmatter(source: string): Record<string, FrontmatterValue> {
  if (!source.startsWith('---')) return {};
  const end = source.indexOf('\n---', 3);
  if (end === -1) return {};
  const lines = source.slice(3, end).split('\n');
  const data: Record<string, FrontmatterValue> = {};
  let currentArrayKey: string | undefined;
  let currentArrayItem: Record<string, unknown> | undefined;
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const arrayItem = line.match(/^\s*-\s*(.+)$/);
    if (arrayItem && currentArrayKey) {
      const list = Array.isArray(data[currentArrayKey]) ? (data[currentArrayKey] as Array<Record<string, unknown>>) : [];
      const itemText = arrayItem[1];
      const objectMatch = itemText.match(/^([^:]+):\s*(.+)$/);
      currentArrayItem = objectMatch ? { [objectMatch[1].trim()]: parseScalar(objectMatch[2]) } : { target: parseScalar(itemText) };
      list.push(currentArrayItem);
      data[currentArrayKey] = list;
      continue;
    }
    const continuationItem = line.match(/^\s+([A-Za-z0-9_-]+):\s*(.+)$/);
    if (continuationItem && currentArrayKey && currentArrayItem) {
      currentArrayItem[continuationItem[1]] = parseScalar(continuationItem[2]);
      continue;
    }
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    if (!value) {
      data[key] = [];
      currentArrayKey = key;
      currentArrayItem = undefined;
    } else {
      data[key] = parseScalar(value);
      currentArrayKey = undefined;
      currentArrayItem = undefined;
    }
  }
  return data;
}


async function walkFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  }));
  return files.flat();
}

async function collectContentNodes() {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  if (!existsSync(CONTENT_DIR)) return { nodes, edges };
  const collections = await readdir(CONTENT_DIR, { withFileTypes: true });
  for (const collection of collections.filter((entry) => entry.isDirectory())) {
    const collectionDir = path.join(CONTENT_DIR, collection.name);
    const files = await walkFiles(collectionDir);
    for (const fullPath of files.filter((filePath) => /\.(md|mdx)$/.test(filePath))) {
      const source = await readFile(fullPath, 'utf8');
      const frontmatter = parseFrontmatter(source);
      const slug = relative(fullPath).replace(/^src\/content\//, '').replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');
      const type = String(frontmatter.type ?? frontmatter.graph_type ?? singularType(collection.name));
      const id = String(frontmatter.id ?? `${type}:${slug.split('/').slice(1).join('/')}`);
      nodes.set(id, { id, slug, type, title: String(frontmatter.title ?? id), draft: frontmatter.draft === true, filePath: relative(fullPath), source: 'content' });

      for (const field of ['references', 'relationships', 'related_to', 'related', 'supports', 'uses', 'describes', 'cites', 'produces', 'teaches', 'enables', 'authored_by']) {
        const value = frontmatter[field];
        const items = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
        for (const item of items) {
          const itemRecord = typeof item === 'object' && !Array.isArray(item) ? item as Record<string, unknown> : undefined;
          const target = String(itemRecord?.target ?? itemRecord?.id ?? itemRecord?.slug ?? item);
          if (!target || target === '[object Object]') continue;
          edges.push({ source: id, target, relationship: String(itemRecord?.relationship ?? defaultRelationship(field)), field, filePath: relative(fullPath), draft: frontmatter.draft === true });
        }
      }
    }
  }
  return { nodes, edges };
}

async function collectRouteGraph() {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  if (!existsSync(SITE_GRAPH_ROUTE_PATH)) return { nodes, edges };
  const text = await readFile(SITE_GRAPH_ROUTE_PATH, 'utf8');
  const getStringProperty = (objectText: string, property: string) => {
    const match = objectText.match(new RegExp(`(?:^|[,\\s])${property}:\\s*['"]([^'"]+)['"]`));
    return match?.[1];
  };
  const findMatchingDelimiter = (start: number, open: string, close: string) => {
    let depth = 0;
    let quote: string | undefined;
    for (let index = start; index < text.length; index += 1) {
      const character = text[index];
      const previous = text[index - 1];
      if (quote) {
        if (character === quote && previous !== '\\') quote = undefined;
        continue;
      }
      if (character === '"' || character === "'" || character === '`') {
        quote = character;
        continue;
      }
      if (character === open) depth += 1;
      if (character === close) {
        depth -= 1;
        if (depth === 0) return index;
      }
    }
    return -1;
  };
  const getArrayItems = (property: string) => {
    const propertyMatch = text.match(new RegExp(`(?:^|[,\\s])${property}:\\s*\\[`));
    if (propertyMatch?.index === undefined) return [];
    const arrayStart = text.indexOf('[', propertyMatch.index);
    const arrayEnd = findMatchingDelimiter(arrayStart, '[', ']');
    if (arrayEnd === -1) return [];
    const arrayText = text.slice(arrayStart + 1, arrayEnd);
    return [...arrayText.matchAll(/\{/g)]
      .map((match) => {
        const objectStart = arrayStart + 1 + (match.index ?? 0);
        const objectEnd = findMatchingDelimiter(objectStart, '{', '}');
        return objectEnd === -1 ? undefined : text.slice(objectStart + 1, objectEnd);
      })
      .filter((objectText): objectText is string => Boolean(objectText));
  };
  for (const objectText of getArrayItems('nodes')) {
    const id = getStringProperty(objectText, 'id');
    const type = getStringProperty(objectText, 'type');
    const title = getStringProperty(objectText, 'title');
    if (id && type && title) {
      nodes.push({ id, slug: id, type, title, draft: false, filePath: relative(SITE_GRAPH_ROUTE_PATH), source: 'site-graph route' });
    }
  }
  for (const objectText of getArrayItems('edges')) {
    const source = getStringProperty(objectText, 'source');
    const target = getStringProperty(objectText, 'target');
    const relationship = getStringProperty(objectText, 'relationship');
    if (source && target && relationship) {
      edges.push({ source, target, relationship, field: 'edges[].relationship', filePath: relative(SITE_GRAPH_ROUTE_PATH) });
    }
  }
  return { nodes, edges };
}

function resolveTarget(target: string, nodes: Map<string, GraphNode>) {
  if (nodes.has(target)) return nodes.get(target);
  return [...nodes.values()].find((node) => node.slug === target || node.id.endsWith(`:${target}`));
}

async function main() {
  if (!VALID_ENVS.includes(deployEnv as DeployEnv)) {
    addDiagnostic({ code: 'DRG300', severity: 'error', message: `Invalid PUBLIC_DEPLOY_ENV "${deployEnv}".`, filePath: '.env', field: 'PUBLIC_DEPLOY_ENV', fix: `Set PUBLIC_DEPLOY_ENV to one of: ${VALID_ENVS.join(', ')}.` });
  }
  const env = VALID_ENVS.includes(deployEnv as DeployEnv) ? deployEnv as DeployEnv : 'development';
  const { allowedNodeTypes, allowedRelationships } = await parseAllowedLists();
  const contentGraph = await collectContentNodes();
  const routeGraph = await collectRouteGraph();
  const nodes = new Map(contentGraph.nodes);
  for (const node of routeGraph.nodes) nodes.set(node.id, node);
  const edges = [...contentGraph.edges, ...routeGraph.edges];

  for (const node of nodes.values()) {
    if (!allowedNodeTypes.has(node.type)) {
      addDiagnostic({ code: 'DRG004', severity: 'error', message: `Invalid graph node type "${node.type}" for "${node.id}".`, filePath: node.filePath, field: 'type', target: node.id, fix: `Use one of the allowed node types from docs/content-model.md: ${[...allowedNodeTypes].join(', ')}.` });
    }
  }

  const connectedPublished = new Set<string>();
  for (const edge of edges) {
    if (!allowedRelationships.has(edge.relationship)) {
      addDiagnostic({ code: 'DRG003', severity: 'error', message: `Invalid graph relationship "${edge.relationship}".`, filePath: edge.filePath, field: edge.field, target: edge.target, fix: `Use one of the allowed relationships from docs/content-model.md: ${[...allowedRelationships].join(', ')}.` });
    }
    const source = resolveTarget(edge.source, nodes);
    const target = resolveTarget(edge.target, nodes);
    if (!source || !target) {
      addDiagnostic({ code: 'DRG001', severity: 'error', message: `Referenced graph slug/id does not exist.`, filePath: edge.filePath, field: edge.field, target: !source ? edge.source : edge.target, fix: 'Check for a typo, add the missing content file/node, or remove the reference.' });
      continue;
    }
    if (!source.draft && !target.draft) {
      connectedPublished.add(source.id);
      connectedPublished.add(target.id);
    }
    if (!source.draft && target.draft) {
      addDiagnostic({ code: 'DRG002', severity: env === 'production' ? 'error' : 'warning', message: `Published content "${source.id}" references draft content "${target.id}".`, filePath: edge.filePath, field: edge.field, target: target.id, fix: 'Publish the target, remove the reference, or keep the relationship out of production.' });
    }
  }

  for (const node of nodes.values()) {
    if (!node.draft && !connectedPublished.has(node.id)) {
      addDiagnostic({ code: 'DRG010', severity: 'warning', message: `Published graph node "${node.id}" is orphaned.`, filePath: node.filePath, field: 'id', target: node.id, fix: 'Add at least one valid relationship to or from this published node, or intentionally leave it orphaned for Version 1.' });
    }
  }

  console.log('Content graph validation summary');
  console.log(`Environment: ${env}`);
  console.log(`Nodes checked: ${nodes.size}`);
  console.log(`Edges checked: ${edges.length}`);
  for (const diagnostic of diagnostics) console[diagnostic.severity === 'error' ? 'error' : 'warn'](formatDiagnostic(diagnostic));
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error').length;
  const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length;
  console.log(`Validation complete: ${errors} error(s), ${warnings} warning(s).`);
  if (errors > 0) process.exit(1);
}

await main();
