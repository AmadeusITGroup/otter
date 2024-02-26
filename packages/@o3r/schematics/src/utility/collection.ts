import { SchematicContext } from '@angular-devkit/schematics';
import type { WorkspaceSchema, WorkspaceSchematics } from '../interfaces';

/**
 * Register the collection schematic to the workspace
 * @param workspace Workspace to add the collection to
 * @param collection Collection to add to the workspace schematic collection
 * @returns the updated workspace
 */
export function registerCollectionSchematics(workspace: WorkspaceSchema, collection: string): WorkspaceSchema {
  workspace.cli ||= {};
  workspace.cli.schematicCollections ||= ['@schematics/angular'];
  if (!workspace.cli.schematicCollections.includes(collection)) {
    workspace.cli.schematicCollections.unshift(collection);
  }
  return workspace;
}

/**
 * Get default options for a schematic
 * This will look inside angular.json file for schematics with keys containing wildcards like `*:ng-add` or `@o3r/core:*`
 * @param workspace
 * @param collection
 * @param schematicName
 * @param options
 * @param options.projectName
 */
export function getDefaultOptionsForSchematic
  <T extends WorkspaceSchematics['*:*'] = WorkspaceSchematics['*:*']>(workspace: WorkspaceSchema | null, collection: string, schematicName: string, options?: { projectName?: string | undefined }): T {
  if (!workspace) {
    return {} as T;
  }
  const schematicsDefaultParams = [
    workspace.schematics,
    ...options?.projectName ? [workspace.projects[options.projectName]?.schematics] : []
  ];

  return schematicsDefaultParams.reduce((acc, schematics) => {
    if (!schematics) {
      return acc;
    }

    return Object.entries<Record<string, string>>(schematics)
      .filter(([key, _]) => new RegExp(key.replace(/[*]/g, '.*')).test(`${collection}:${schematicName}`))
      .sort(([a], [b]) => (a.match(/\*/g)?.length || 0) - (b.match(/\*/g)?.length || 0))
      .map(([_, value]) => value)
      .reduce((config, value) => ({...config, ...value}), acc);
  }, {} as T);
}

/**
 * Retrieves the schematics options of a given schematics name
 * If the schematics name is not found, then the generic options (*:*) will be returned. If the latter is not present the function returns undefined
 * @param config
 * @param context
 */
export function getSchematicOptions<T extends WorkspaceSchematics['*:*'] = WorkspaceSchematics['*:*']>(config: WorkspaceSchema, context: SchematicContext): T | undefined {
  const schematicName = `${context.schematic.description.collection.name}:${context.schematic.description.name}`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const options = config.schematics && Object.entries(config.schematics)
    .filter(([name]) => new RegExp(name.replace(/\*/g, '.*')).test(schematicName))
    .sort(([a], [b]) => ((a.match(/\*/g)?.length || 0) - (b.match(/\*/g)?.length || 0)))
    .reduce((acc, [, opts]) => ({ ...acc, ...opts }), {} as any);

  return options && Object.keys(options).length ? options : config.schematics?.['*:*'];
}
