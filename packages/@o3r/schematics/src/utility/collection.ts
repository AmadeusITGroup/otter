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
  workspace.cli.schematicCollections ||= [];
  if (!workspace.cli.schematicCollections.includes(collection)) {
    workspace.cli.schematicCollections.push(collection);
  }
  return workspace;
}
