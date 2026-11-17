import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import { parse } from 'yaml';

type WorkflowTriggers = {
  pull_request?: unknown;
  push?: {
    branches?: string[];
  };
};

test('CI validates pull requests and pushes to the production branch', async () => {
  const source = await fs.readFile(new URL('../.github/workflows/CI.yml', import.meta.url), 'utf8');
  const workflow = parse(source) as { on?: WorkflowTriggers };

  assert.ok(workflow.on, 'CI workflow must define event triggers');
  assert.ok(Object.hasOwn(workflow.on, 'pull_request'), 'CI workflow must validate pull requests');
  assert.deepEqual(
    workflow.on.push?.branches,
    ['official-site'],
    'CI workflow must validate pushes to the production branch',
  );
});
