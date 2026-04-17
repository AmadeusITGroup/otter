import type {
  NgAddOptions,
  SchematicOptionObject,
} from '@o3r/schematics';

/**
 * Schema for ng-add schematic
 */
export interface NgAddSchematicsSchema extends NgAddOptions, SchematicOptionObject {
  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;
}
