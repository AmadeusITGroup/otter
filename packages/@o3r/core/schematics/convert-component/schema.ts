import type {
  SchematicOptionObject,
} from '@o3r/schematics';
import type {
  ComponentType,
} from '@o3r/core';

export interface ConvertToO3rComponentSchematicsSchema extends SchematicOptionObject {
  /** Path to the component to convert */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Type of the component */
  componentType: ComponentType;
}
