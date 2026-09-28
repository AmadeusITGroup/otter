#!/usr/bin/env node
/* eslint-disable no-console -- only logger available */
/*
 * PROTOTYPE — Option A: "let Nx do the hashing, we just scope it".
 *
 * By default Nx uses the `AllExternalDependencies` input for every task, so ANY
 * change to yarn.lock invalidates the cache of every task. This script narrows
 * that: for each workspace project it reads the Nx project graph, extracts the
 * npm packages the project *actually* depends on, and writes them as an
 * `externalDependencies` named input into the project's `project.json`.
 *
 * We only write the DIRECT npm dependencies: when an `externalDependencies`
 * entry names a package, Nx's (native) hasher expands its transitive closure
 * and resolves versions/hashes from yarn.lock on its own. So the generated
 * lists stay small and human-reviewable while remaining transitively correct.
 *
 * The generated named input is `usedExternalDependencies`. Target defaults in
 * nx.json reference it (e.g. "inputs": ["source", "usedExternalDependencies"]),
 * which REPLACES the AllExternalDependencies default for that task.
 *
 * Usage:
 *   yarn node tools/@o3r/build-helpers/scripts/generate-external-deps-inputs.mjs [--check] [--json]
 *     --check  exit 1 if any project.json would change (for CI drift detection)
 *     --json   print a summary report as JSON instead of writing files
 */

import {
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {
  join,
} from 'node:path';
import minimist from 'minimist';
import {
  createProjectGraphAsync,
} from 'nx/src/project-graph/project-graph.js';

const NAMED_INPUT = 'usedExternalDependencies';

const parsedArgs = minimist(process.argv.slice(2));
const isCheck = parsedArgs.check === true;
const isJson = parsedArgs.json === true;

/**
 * Collect the direct npm dependencies of a project from the Nx graph.
 * @param {import('nx/src/config/project-graph').ProjectGraph} graph
 * @param {string} projectName
 * @returns {string[]} sorted, de-duplicated package names (without the `npm:` prefix or version)
 */
const getDirectNpmDependencies = (graph, projectName) => {
  const edges = graph.dependencies[projectName] || [];
  const names = new Set();
  for (const edge of edges) {
    if (!edge.target.startsWith('npm:')) {
      continue;
    }
    const node = graph.externalNodes[edge.target];
    // Prefer the resolved packageName (strips the version suffix that some edges carry)
    const packageName = node?.data?.packageName ?? edge.target.slice('npm:'.length).replace(/@[^@/]+$/, '');
    names.add(packageName);
  }
  return [...names].toSorted();
};

const main = async () => {
  const graph = await createProjectGraphAsync({ exitOnError: false });

  const report = {};
  let changed = 0;

  for (const [projectName, node] of Object.entries(graph.nodes)) {
    const root = node.data.root;
    const packages = getDirectNpmDependencies(graph, projectName);
    report[projectName] = { root, count: packages.length };

    if (isJson) {
      continue;
    }

    const projectJsonPath = join(root, 'project.json');
    let raw;
    try {
      raw = readFileSync(projectJsonPath, { encoding: 'utf8' });
    } catch {
      // Some graph nodes (e.g. the workspace root) have no project.json — skip them.
      report[projectName].skipped = true;
      continue;
    }

    const projectJson = JSON.parse(raw);
    const desired = [{ externalDependencies: packages }];
    const current = projectJson.namedInputs?.[NAMED_INPUT];

    if (JSON.stringify(current) === JSON.stringify(desired)) {
      continue;
    }

    projectJson.namedInputs ||= {};
    projectJson.namedInputs[NAMED_INPUT] = desired;

    report[projectName].changed = true;
    changed += 1;

    if (!isCheck) {
      writeFileSync(projectJsonPath, `${JSON.stringify(projectJson, null, 2)}\n`, { encoding: 'utf8' });
    }
  }

  if (isJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (isCheck && changed > 0) {
    console.error(`${changed} project.json file(s) are out of date. Run: yarn nx:external-deps:generate`);
    process.exit(1);
  }

  console.log(`Processed ${Object.keys(graph.nodes).length} project(s); updated ${changed} project.json file(s).`);
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
