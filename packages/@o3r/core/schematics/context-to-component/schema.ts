import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddConfigSchematicsSchema extends SchematicOptionObject {
  /** Path to the component */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;
}
