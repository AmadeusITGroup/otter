/*
 * PROTOTYPE — Option B: a custom Nx hasher (the "compute the hash ourselves"
 * approach), verified against Nx 22.7.6.
 *
 * Nx calls this with (task, context) and expects a `Hash` back
 * ({ value, details, inputs }). See nx/dist/src/hasher/hash-task.js:74.
 *
 * Unlike Option A (which writes `externalDependencies` named inputs into every
 * project.json) and unlike the failed createNodesV2 attempt (whose injected
 * inputs were dropped during config merge), this bypasses named inputs
 * entirely: it is attached to the executor via `hasherFactory` and computes the
 * final hash value directly. Nothing is written to disk.
 *
 * Strategy:
 *   1. Ask Nx's DEFAULT hasher for the task's hash — but with external
 *      dependencies neutralised (nx.json declares `externalDependencies: []`
 *      in `base`, so the default no longer folds in ALL deps). This preserves
 *      every other input (source files, configs, env, runtime, ^deps).
 *   2. Walk the transitive closure of the project's own external dependencies
 *      from `context.projectGraph`, combine each reached package's yarn.lock
 *      content hash, and fold that digest into the final value.
 *
 * Result: the task re-runs only when a dependency the project ACTUALLY uses
 * changes in yarn.lock — not on unrelated bumps.
 *
 * Blind spot (shared with Option A): tools invoked purely via CLI / dynamic
 * import that are not edges in the project graph are not captured. For a
 * jest-executed task the runner deps ARE import edges, so this is low-risk here.
 */

import {
  createHash,
} from 'node:crypto';

/**
 * Collect the transitive closure of external (npm) nodes reachable from a project.
 * @param {import('nx/src/config/project-graph').ProjectGraph} projectGraph
 * @param {string} projectName
 * @returns {string[]} sorted external node ids (e.g. `npm:typescript@5.9.2`)
 */
const collectTransitiveExternalNodes = (projectGraph, projectName) => {
  const visited = new Set();
  const externals = new Set();
  const stack = [projectName];

  while (stack.length > 0) {
    const current = stack.pop();
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    for (const edge of projectGraph.dependencies[current] || []) {
      const { target } = edge;
      if (target.startsWith('npm:')) {
        if (!externals.has(target)) {
          externals.add(target);
          stack.push(target);
        }
      } else if (!visited.has(target)) {
        stack.push(target);
      }
    }
  }

  return [...externals].toSorted();
};

/**
 * Build a stable digest from the yarn.lock content hashes of the given externals.
 * @param {import('nx/src/config/project-graph').ProjectGraph} projectGraph
 * @param {string[]} externalIds
 * @returns {string} hex digest
 */
const digestExternals = (projectGraph, externalIds) => {
  const hasher = createHash('sha256');
  for (const id of externalIds) {
    const data = projectGraph.externalNodes?.[id]?.data;
    hasher.update(`${id}@${data?.hash ?? data?.version ?? '?'}\n`);
  }
  return hasher.digest('hex');
};

/**
 * Custom hasher: default task hash folded with a digest of the project's
 * transitively-used external dependencies.
 * @type {import('nx/src/config/misc-interfaces').CustomHasher}
 */
const externalDepsHasher = async (task, context) => {
  // 1. Default hash for everything except external deps (neutralised in nx.json).
  const base = await context.hasher.hashTask(task, context.taskGraph, context.env);

  // 2. Digest of the transitive external deps this project actually uses.
  const externals = collectTransitiveExternalNodes(context.projectGraph, task.target.project);
  const externalDigest = digestExternals(context.projectGraph, externals);

  // 3. Fold the digest into the final value.
  const value = createHash('sha256')
    .update(base.value)
    .update(externalDigest)
    .digest('hex');

  return {
    value,
    details: {
      ...base.details,
      nodes: {
        ...base.details?.nodes,
        'external-deps-digest': externalDigest
      }
    },
    inputs: base.inputs
  };
};

export default externalDepsHasher;
