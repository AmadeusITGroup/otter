import * as path from 'node:path';
import {
  Rule,
} from '@angular-devkit/schematics';
import {
  getExternalDependenciesInfo,
  getWorkspaceConfig,
  type SetupDependenciesOptions,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';

const o3rPackageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');

/**
 * Update package.json to add additional dependencies
 * @param dependenciesSetupConfig
 * @param dependenciesToInstall
 * @param devDependenciesToInstall
 * @param projectName
 */
export function updatePackageJson(
  dependenciesSetupConfig: SetupDependenciesOptions,
  dependenciesToInstall: string[],
  devDependenciesToInstall: string[],
  projectName?: string
): Rule {
  return (tree, context) => {
    const workspaceConfig = getWorkspaceConfig(tree);
    const workspaceProject = (projectName && workspaceConfig?.projects?.[projectName]) || undefined;
    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;

    dependenciesSetupConfig.dependencies = {
      ...dependenciesSetupConfig.dependencies,
      ...getExternalDependenciesInfo({
        dependenciesToInstall,
        devDependenciesToInstall,
        o3rPackageJsonPath,
        projectType: workspaceProject?.projectType,
        projectPackageJson
      }, context.logger)
    };

    return tree;
  };
}
