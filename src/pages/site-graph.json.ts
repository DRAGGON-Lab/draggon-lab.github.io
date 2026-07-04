import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const environment = process.env.PUBLIC_DEPLOY_ENV ?? 'development';
  const graph = {
    metadata: {
      site: 'DRAGGON Lab',
      url: 'https://draggonlab.org',
      generated_at: new Date().toISOString(),
      environment,
      schema_version: 1,
    },
    nodes: [
      {
        id: 'research:ai-aided-biodesign',
        type: 'research',
        title: 'AI-Aided Biodesign',
        url: '/research',
        summary: 'Machine learning and hybrid models for biological design.',
        tags: ['AI/ML', 'biodesign'],
      },
      {
        id: 'tool:loica',
        type: 'tool',
        title: 'LOICA',
        url: '/tools',
        summary: 'Design automation for genetic networks.',
        tags: ['design automation', 'genetic networks'],
      },
    ],
    edges: [
      {
        source: 'tool:loica',
        target: 'research:ai-aided-biodesign',
        relationship: 'supports',
        label: 'supports AI-aided genetic network design',
      },
    ],
  };
  return new Response(JSON.stringify(graph, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
