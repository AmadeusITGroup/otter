#!/usr/bin/env node

import {
  existsSync,
  readFileSync,
} from 'node:fs';
import {
  dirname,
  join,
  relative,
  resolve,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import {
  globbySync,
} from 'globby';

const VITEST_CONFIG_NAMES = [
  'vitest.config.ts',
  'vitest.config.mts',
  'vitest.config.js',
  'vitest.config.mjs'
];

/**
 * Checks whether an Nx dependency list delegates to the Vitest target.
 * @param {unknown} dependsOn Nx target dependencies.
 * @returns {boolean} Whether the Vitest target is referenced.
 */
export const hasVitestDependency = (dependsOn) => Array.isArray(dependsOn)
  && dependsOn.some((dependency) => dependency === 'vitest'
    || (typeof dependency === 'object' && dependency !== null && dependency.target === 'vitest'));

/**
 * Validates the Vitest signals for one Nx project.
 * Jest-only projects are accepted during the incremental migration; once any
 * Vitest signal is present, all three signals must agree.
 * @param {object} options Validation options.
 * @param {string} options.projectFile Workspace-relative project file path.
 * @param {{targets?: Record<string, {executor?: string, dependsOn?: unknown}>}} options.project Parsed Nx project configuration.
 * @param {string | undefined} options.vitestConfig Workspace-relative Vitest config path.
 * @returns {string[]} Validation errors.
 */
export const validateProjectTestRunner = ({ projectFile, project, vitestConfig }) => {
  const targets = project.targets ?? {};
  const hasConfig = !!vitestConfig;
  const hasNamedVitestTarget = Object.hasOwn(targets, 'vitest');
  const testTarget = targets.test;
  const hasDirectVitestTarget = testTarget?.executor === '@nx/vitest:test';
  const hasTarget = hasNamedVitestTarget || hasDirectVitestTarget;
  const delegatesToVitest = hasDirectVitestTarget || (testTarget?.executor === 'nx:noop'
    && hasVitestDependency(testTarget.dependsOn));

  if (!hasConfig && !hasTarget && !delegatesToVitest) {
    return [];
  }

  const errors = [];
  if (!hasConfig) {
    errors.push(`${projectFile}: declares Vitest wiring but has no vitest.config.* file.`);
  }
  if (!hasTarget) {
    errors.push(`${projectFile}: has Vitest configuration but no "vitest" target.`);
  }
  if (!delegatesToVitest) {
    errors.push(`${projectFile}: Vitest projects must use @nx/vitest:test directly or set "test" to nx:noop with dependsOn: ["vitest"].`);
  }
  return errors;
};

/**
 * Finds the Vitest configuration beside an Nx project file.
 * @param {string} projectDirectory Absolute project directory.
 * @returns {string | undefined} Absolute config path when present.
 */
export const findVitestConfig = (projectDirectory) => VITEST_CONFIG_NAMES
  .map((name) => join(projectDirectory, name))
  .find((path) => existsSync(path));

/**
 * Checks that every partially or fully migrated Nx project has coherent
 * Vitest configuration and target wiring.
 * @param {string} workspaceRoot Absolute workspace root.
 * @returns {{projectCount: number, vitestProjectCount: number, errors: string[]}} Check result.
 */
export const checkTestRunnerConfig = (workspaceRoot) => {
  const projectFiles = globbySync('{apps,mcps,packages,tools}/**/project.json', {
    absolute: true,
    cwd: workspaceRoot,
    gitignore: true
  });
  let vitestProjectCount = 0;
  const errors = projectFiles.flatMap((absoluteProjectFile) => {
    const projectFile = relative(workspaceRoot, absoluteProjectFile);
    const project = JSON.parse(readFileSync(absoluteProjectFile, 'utf8'));
    const absoluteVitestConfig = findVitestConfig(dirname(absoluteProjectFile));
    const vitestConfig = absoluteVitestConfig && relative(workspaceRoot, absoluteVitestConfig);
    const projectErrors = validateProjectTestRunner({ projectFile, project, vitestConfig });
    if (vitestConfig || Object.hasOwn(project.targets ?? {}, 'vitest')
      || project.targets?.test?.executor === '@nx/vitest:test') {
      vitestProjectCount++;
    }
    return projectErrors;
  });

  return {
    projectCount: projectFiles.length,
    vitestProjectCount,
    errors
  };
};

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const workspaceRoot = resolve(import.meta.dirname, '..', '..', '..', '..');
  const result = checkTestRunnerConfig(workspaceRoot);
  if (result.errors.length > 0) {
    throw new Error(`Test-runner configuration drift detected:\n${result.errors.join('\n')}`);
  }
  process.stdout.write(`Checked ${result.projectCount} Nx projects; ${result.vitestProjectCount} have coherent Vitest wiring.\n`);
}
