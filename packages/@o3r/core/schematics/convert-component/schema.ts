import type {
  SchematicOptionObject,
} from '@o3r/schematics';
import type {
  ComponentType,
} from '../..';

export interface ConvertToO3rComponentSchematicsSchema extends SchematicOptionObject {
  /** Path to the component to convert */
  path: string;

  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /** Type of the component */
  componentType: ComponentType;
}
