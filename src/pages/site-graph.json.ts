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
        id: 'research:autonomous-laboratories',
        type: 'research',
        title: 'Autonomous Laboratories',
        url: '/research/autonomous-laboratories/',
        summary:
          'Autonomous DBTL facilities coordinating software, instruments, humanoid robots, samples, and learning.',
        tags: ['autonomous laboratories', 'DBTL', 'robotics', 'facility orchestration'],
      },
      {
        id: 'project-direction:autonomous-laboratory-operations',
        type: 'project-direction',
        title: 'Autonomous Laboratory Operations',
        url: '/project-directions',
        summary:
          'Facility orchestration, humanoid robotics, equipment integration, and safe recovery for sustained DBTL campaigns.',
        tags: ['autonomous laboratories', 'facility management', 'humanoid robotics'],
      },
      {
        id: 'workflow:autonomous-dbtl-facility',
        type: 'workflow',
        title: 'Autonomous DBTL Facility Workflow',
        url: '/tools',
        summary:
          'A planned facility workflow for scheduling, execution, measurement, storage, recovery, and learning.',
        tags: ['autonomous laboratories', 'DBTL', 'facility orchestration'],
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
      {
        source: 'research:autonomous-laboratories',
        target: 'research:ai-aided-biodesign',
        relationship: 'related_to',
        label: 'uses AI agents for orchestration and learning',
      },
      {
        source: 'research:autonomous-laboratories',
        target: 'project-direction:autonomous-laboratory-operations',
        relationship: 'related_to',
        label: 'develops autonomous facility operations',
      },
      {
        source: 'research:autonomous-laboratories',
        target: 'workflow:autonomous-dbtl-facility',
        relationship: 'produces',
        label: 'produces an autonomous facility workflow',
      },
      {
        source: 'project-direction:autonomous-laboratory-operations',
        target: 'research:autonomous-laboratories',
        relationship: 'enables',
        label: 'enables autonomous laboratories',
      },
      {
        source: 'project-direction:autonomous-laboratory-operations',
        target: 'workflow:autonomous-dbtl-facility',
        relationship: 'produces',
        label: 'produces the facility operations workflow',
      },
    ],
  };
  return new Response(JSON.stringify(graph, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
