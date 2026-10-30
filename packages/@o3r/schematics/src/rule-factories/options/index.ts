import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  getDefaultOptionsForSchematic,
} from '../../utility/collection';
import {
  getDefaultProjectName,
  getWorkspaceConfig,
} from '../../utility/loaders';

/**
 * Factory of the schematic to wrap
 * @param options Options of the factory
 */
type SchematicWrapperFn<S extends Record<string, any>> = (options: S) => Rule;

/**
 * Wrapper method of a schematic to retrieve options from workspace and merge it with the one from the run of the schematic
 * NOTE: please do not use it directly, instead use {@link createOtterSchematic} to wrap your schematic
 * @param schematicFn
 */
export function createSchematicWithOptionsFromWorkspace<S extends Record<string, any>>(schematicFn: SchematicWrapperFn<S>): SchematicWrapperFn<S> {
  return (options) => (tree, context) => {
    const workspace = getWorkspaceConfig(tree);
    // The `projectName` default is not provided by the schema (the Angular CLI throws when it cannot determine a project).
    // It is resolved before reading the workspace defaults so that the project-level ones are applied.
    const hasProjectNameOption = !!(context.schematic.description as { schemaJson?: { properties?: Record<string, unknown> } }).schemaJson?.properties?.projectName;
    const projectName = (options.projectName as string | undefined) || (hasProjectNameOption ? getDefaultProjectName(workspace) : undefined);
    const workspaceOptions = getDefaultOptionsForSchematic(
      workspace,
      context.schematic.description.collection.name,
      context.schematic.description.name,
      { ...options, projectName }
    );
    const schematicOptionsWithoutUndefined = Object.entries(options).reduce((acc: Record<string, any>, [key, value]) => {
      if (typeof value !== 'undefined') {
        acc[key] = value;
      }
      return acc;
    }, {}) as S;
    const schematicOptions = {
      ...(projectName ? { projectName } : {}),
      ...workspaceOptions,
      ...schematicOptionsWithoutUndefined
    };
    return schematicFn(schematicOptions satisfies S);
  };
}
