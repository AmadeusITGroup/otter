import type { WorkspaceSchema } from '../interfaces';

/**
 * Register the collection schematic to the workspace
 *
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
 *
 * @param workspace
 * @param collection
 * @param schematicName
 * @param options
 * @param options.projectName
 */
export function getDefaultOptionsForSchematic(workspace: WorkspaceSchema | null, collection: string, schematicName: string, options: {projectName: string | null}) {
  if (!workspace) {
    return {};
  }
  const schematicsDefaultParams = [
    workspace.schematics,
    ...options.projectName ? [workspace.projects[options.projectName]?.schematics] : []
  ];
  return schematicsDefaultParams.flatMap((schematics) => schematics ?
    Object.entries<Record<string, string>>(schematics)
      .filter(([key, _]) => key === `*:${schematicName}` || key === `${collection}:*`)
      .map(([_, value]) => value) :
    []
  ).reduce((out, defaultParams) => ({...out, ...defaultParams}), {});
}
