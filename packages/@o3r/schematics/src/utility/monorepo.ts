import type { SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';
import type { WorkspaceLayout, WorkspaceProject, WorkspaceSchema } from '../interfaces/index';
import { getSchematicOptions } from './collection';
import type { PackageJson } from 'type-fest';
import { getWorkspaceConfig } from './loaders';

/**
 * Find the relative path to a configuration file at the monorepo root
 * @param tree
 * @param files List of files to look for, the first of the list will be used
 * @param originPath Path from where to calculate the relative path
 * @returns
 */
export function findConfigFileRelativePath(tree: Tree, files: string[], originPath: string) {
  const foundFile = files.find((file) => tree.exists(`/${file}`));
  if (foundFile === undefined) {
    return '';
  }

  return path.posix.relative(originPath, `/${foundFile}`);
}

/**
 * Determine if we are in an Nx Monorepo context
 * @param tree
 */
export function isNxContext(tree: Tree) {
  return tree.exists('/nx.json');
}

/**
 * Determine if a repository is standalone (not part of a monorepo)
 * @param tree
 */
export function isStandaloneRepository(tree: Tree) {
  const workspaceConfig = getWorkspaceConfig(tree);
  return workspaceConfig && Object.keys(workspaceConfig.projects || {}).length === 1 && Object.values(workspaceConfig.projects)[0].root === '';
}

/**
 * Determine if we are in a project with multi packages
 * @param tree
 */
export function isMultipackagesContext(tree: Tree) {
  return !!(tree.readJson('/package.json') as PackageJson).wokspaces;
}

/** Default name of the folder where libraries will be generated inside monorepo */
export const LIBRARIES_FOLDER_NAME = 'libs';
/** Default name of the folder where applications will be generated inside monorepo */
export const APPLICATIONS_FOLDER_NAME = 'apps';

/** Default directories for generated apps/libs inside a monorepo */
export const DEFAULT_ROOT_FOLDERS: WorkspaceLayout = {
  libsDir: LIBRARIES_FOLDER_NAME,
  appsDir: APPLICATIONS_FOLDER_NAME
};

/** Root folders map for apps/libs inside a monorepo */
export const BASE_ROOT_FOLDERS_MAP: Record<WorkspaceProject['projectType'], keyof WorkspaceLayout> = {
  library: 'libsDir',
  application: 'appsDir'
};

/**
 * Retrieve the project base root generation folder, based on the given projectType.
 * - The default project root will be returned if there is no project root found in nx.json or angular.json (in schematics options)
 * - The root path '/' will be returned if no project type given
 * @param tree
 * @param context
 * @param config
 * @param projectType
 */
export function getPackagesBaseRootFolder(tree: Tree, context: SchematicContext, config: WorkspaceSchema, projectType?: WorkspaceProject['projectType']) {
  const configName = projectType && BASE_ROOT_FOLDERS_MAP[projectType];
  const nxExplicitDir = configName && isNxContext(tree) && (tree.readJson('/nx.json') as any)?.workspaceLayout[configName];

  const schematicConfigDir = configName && getSchematicOptions(config, context)?.[configName];

  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  return schematicConfigDir || nxExplicitDir || ((projectType && configName) ? DEFAULT_ROOT_FOLDERS[configName] : '.');
}
