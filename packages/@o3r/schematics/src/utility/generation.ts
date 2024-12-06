import type {
  JsonValue,
} from '@angular-devkit/core';
import type {
  Tree,
} from '@angular-devkit/schematics';
import {
  getDefaultOptionsForSchematic,
} from './collection';
import {
  O3rCliError,
} from './error';
import {
  getWorkspaceConfig,
} from './loaders';

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
export const OTTER_ITEM_TYPES = [
  '@o3r/core:component',
  '@o3r/core:page',
  '@o3r/core:service',
  '@o3r/core:store',
  '@o3r/core:schematics-update',
  '@o3r/testing:playwright-scenario',
  '@o3r/testing:playwright-sanity'
] as const satisfies GeneratedItemType[];

/** List of the default destination paths for each generated entity */
export const TYPES_DEFAULT_FOLDER: { [key in GeneratedItemType]: { app?: string; lib?: string } } = {
  '@o3r/core:component': { app: 'src/components', lib: 'src/components' },
  '@o3r/core:page': { app: 'src/app' },
  '@o3r/core:service': { app: 'src/services', lib: 'src/services' },
  '@o3r/core:store': { app: 'src/store', lib: 'src/store' },
  '@o3r/core:schematics-update': { app: 'src/schematics', lib: 'src/schematics' },
  '@o3r/testing:playwright-scenario': { app: 'e2e-playwright/scenarios' },
  '@o3r/testing:playwright-sanity': { app: 'e2e-playwright/sanity' }
};

/**
 * Get destination path for a generated item
 * @param typeOfItem
 * @param directory
 * @param tree
 * @param project
 */
export function getDestinationPath(typeOfItem: GeneratedItemType, directory: string | null | undefined, tree: Tree, project?: string | null): string {
  if (directory) {
    return directory;
  }

  const getSchematicsProperty = <T extends { [x: string]: JsonValue } = { [x: string]: JsonValue }>(generatorName: GeneratedItemType, propTree: Tree, propProject?: string | null): T | null => {
    const workspace = getWorkspaceConfig(propTree);
    const [collection, schematicName] = generatorName.split(':');
    return ((
      workspace && getDefaultOptionsForSchematic<any>(workspace, collection, schematicName, { projectName: propProject || undefined })
    ) || null) as T | null; // TODO: Check why `getDefaultOptionsForSchematic` expect a type matching `WorkspaceLayout`
  };

  const config = getSchematicsProperty(typeOfItem, tree, project);
  if (config && config.path) {
    return config.path as string;
  }

  throw new O3rCliError('No destination directory configured.');
}
