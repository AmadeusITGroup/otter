import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import type {
  PackageJson,
} from 'type-fest';
import {
  createSchematicWithMetricsIfInstalled,
  getExternalDependenciesInfo,
  getWorkspaceConfig,
  setupDependencies,
} from '../../src/public_api';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [
] satisfies { name: string; enforceTildeRange?: boolean; requireInstall?: boolean }[];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@angular-devkit/architect',
  '@angular-devkit/core',
  '@angular-devkit/schematics',
  '@schematics/angular',
  'globby',
  'rxjs'
];

/**
 * Add Otter schematics to an Angular Project
 * @param options schematics options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return (tree, context) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;
    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      o3rPackageJsonPath: packageJsonPath,
      projectType: workspaceProject?.projectType,
      projectPackageJson
    },
    context.logger
    );
    return setupDependencies({
      projectName: options.projectName,
      dependencies: externalDependenciesInfo,
      skipInstall: false
    });
  };
}

/**
 * Add Otter schematics to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => () => {
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
