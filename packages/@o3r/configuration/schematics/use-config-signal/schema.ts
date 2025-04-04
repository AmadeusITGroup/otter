import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgUseConfigSignalSchematicsSchema extends SchematicOptionObject {
  /** Path to the component */
  path: string;

  /** Skip the linter process which includes EsLint and EditorConfig rules applying */
  skipLinter: boolean;
}
