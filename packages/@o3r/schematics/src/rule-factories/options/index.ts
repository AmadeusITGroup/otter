import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  getDefaultOptionsForSchematic,
  getWorkspaceConfig,
} from '../../utility';

/**
 * Factory of the schematic to wrap
 * @param options Options of the factory
 */
type SchematicWrapperFn<S extends Record<string, any>> = (options: S) => Rule;

/**
 * Wrapper method of a schematic to retrieve options from workspace and merge it with the one from the run of the schematic
 * @param schematicFn
 */
export function createSchematicWithOptionsFromWorkspace<S extends Record<string, any>>(schematicFn: SchematicWrapperFn<S>): SchematicWrapperFn<S> {
  return (options) => (tree, context) => {
    const workspace = getWorkspaceConfig(tree);
    const workspaceOptions = getDefaultOptionsForSchematic(
      workspace,
      context.schematic.description.collection.name,
      context.schematic.description.name,
      { projectName: undefined, ...options }
    );
    const schematicOptionsWithoutUndefined = Object.entries(options).reduce((acc: Record<string, any>, [key, value]) => {
      if (typeof value !== 'undefined') {
        acc[key] = value;
      }
      return acc;
    }, {}) as S;
    const schematicOptions = {
      ...workspaceOptions,
      ...schematicOptionsWithoutUndefined
    };
    return schematicFn(schematicOptions satisfies S);
  };
}
