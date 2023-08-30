import { JsonValue } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import type { WorkspaceProject, WorkspaceSchema } from '../interfaces/index';
import { getProjectFromTree, readAngularJson } from './loaders';

/** Type of generated item */
export type GeneratedItemType =
  '@o3r/core:component' |
  '@o3r/core:page' |
  '@o3r/core:service' |
  '@o3r/core:store' |
  '@o3r/core:schematics-update' |
  '@o3r/testing:playwright-scenario' |
  '@o3r/testing:playwright-sanity';

/** List of Otter items types */
export const OTTER_ITEM_TYPES: GeneratedItemType[] = [
  '@o3r/core:component',
  '@o3r/core:page',
  '@o3r/core:service',
  '@o3r/core:store',
  '@o3r/core:schematics-update',
  '@o3r/testing:playwright-scenario',
  '@o3r/testing:playwright-sanity'
];

/** List of the default destination paths for each generated entity */
export const TYPES_DEFAULT_FOLDER: { [key in GeneratedItemType] : {app?: string; lib?: string} } = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '@o3r/core:component': {app: 'src/components', lib: 'components/src'},
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '@o3r/core:page': {app: 'src/app'},
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '@o3r/core:service': {app: 'src/services', lib: 'services/src'},
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '@o3r/core:store': {app: 'src/store', lib: 'store/src'},
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '@o3r/core:schematics-update': {app: 'src/schematics', lib: 'schematics/src'},
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '@o3r/testing:playwright-scenario': { app: 'e2e-playwright/scenarios' },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '@o3r/testing:playwright-sanity': { app: 'e2e-playwright/sanity' }
};

/**
 * Get destination path for a generated item
 *
 * @param typeOfItem
 * @param directory
 * @param tree
 * @param project
 */
export function getDestinationPath(typeOfItem: GeneratedItemType, directory: string | null | undefined, tree: Tree, project?: string | null): string {
  if (directory) {
    return directory;
  }

  /**
   * @param workspace
   * @param generatorName
   */
  const getSchematicsPropertyFrom = <T extends { [x: string]: JsonValue } = { [x: string]: JsonValue }>(
    workspace: WorkspaceProject | WorkspaceSchema,
    generatorName: GeneratedItemType): T | null => {
    return workspace.schematics?.[generatorName] || null;
  };

  /**
   * @param generatorName
   * @param propTree
   * @param propProject
   */
  const getSchematicsProperty = <T extends { [x: string]: JsonValue } = { [x: string]: JsonValue }>(generatorName: GeneratedItemType, propTree: Tree, propProject?: string | null): T | null => {
    const workspaceProject = getProjectFromTree(propTree, propProject);
    return workspaceProject ? getSchematicsPropertyFrom(workspaceProject, generatorName) || getSchematicsPropertyFrom(readAngularJson(propTree), generatorName) : null;
  };

  const config = getSchematicsProperty(typeOfItem, tree, project);
  if (config && config.path) {
    return config.path as string;
  }

  throw new Error('No destination directory configured.');
}
