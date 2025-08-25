import path from 'node:path';
import {
  chain,
  noop,
  type Rule,
} from '@angular-devkit/schematics';
import type {
  PackageJson,
} from 'type-fest';
import {
  applyEsLintFix,
} from '../rule-factories/eslint-fix';
import {
  getPackageInstallConfig,
  setupDependencies,
} from '../rule-factories/ng-add/dependencies';
import {
  getExternalDependenciesInfo,
} from './dependencies';
import {
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
} from './loaders';
import {
  getO3rPeerDeps,
} from './matching-peers';

export interface NgAddOptions {
  /** Project name */
  projectName?: string | undefined;

  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;

  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /** Skip the install process */
  skipInstall: boolean;
}

export const ngAddSchematicWrapper = <Opts extends NgAddOptions>(
  packageJsonPath: string,
  depsToInstall: {
    devDep: string[];
    dep: string[];
  },
  beforeSetupDepsSchematicsFn: (options: Opts) => Rule = () => () => {},
  afterSetupDepsSchematicsFn: (options: Opts) => Rule = () => () => {},
  extraSetupDependenciesOptions: Partial<Parameters<typeof setupDependencies>[0]> = {}
) => (options: Opts): Rule => (tree, context) => {
  const depsInfo = getO3rPeerDeps(packageJsonPath);
  const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
  const projectDirectory = workspaceProject?.root || '.';
  const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;
  const internalDependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
    acc[dep] = {
      inManifest: [{
        range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
        types: getProjectNewDependenciesTypes(workspaceProject)
      }],
      ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
    };
    return acc;
  }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion));
  const externalDependenciesInfo = getExternalDependenciesInfo(
    {
      devDependenciesToInstall: depsToInstall.devDep,
      dependenciesToInstall: depsToInstall.dep,
      o3rPackageJsonPath: packageJsonPath,
      projectType: workspaceProject?.projectType,
      projectPackageJson
    },
    context.logger
  );
  const dependencies = {
    ...internalDependencies,
    ...externalDependenciesInfo
  };

  const ngAddToRun = (extraSetupDependenciesOptions.ngAddToRun || []).concat(depsInfo.o3rPeerDeps);

  return chain([
    beforeSetupDepsSchematicsFn(options),
    setupDependencies({
      projectName: options.projectName,
      skipInstall: options.skipInstall,
      dependencies,
      ...extraSetupDependenciesOptions,
      ngAddToRun
    }),
    afterSetupDepsSchematicsFn(options),
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
};
