import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddAnalyticsSchematicsSchema extends SchematicOptionObject {
  /** Path to the component */
  path: string;

  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /** Determine if the dummy analytics events should be generated */
  activateDummy: boolean;
}
