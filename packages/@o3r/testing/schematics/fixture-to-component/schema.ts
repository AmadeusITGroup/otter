import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddFixtureSchematicsSchema extends SchematicOptionObject {
  /** Path to the component */
  path: string;

  /** Path to spec file of the component */
  specFilePath?: string | undefined;

  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /** Is the component a page */
  page: boolean;
}
