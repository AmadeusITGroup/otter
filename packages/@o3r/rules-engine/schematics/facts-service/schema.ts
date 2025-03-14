import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgGenerateFactsServiceSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Facts services Folder */
  path: string;

  /** Fact service name */
  name: string;

  /** Skip the linter process which includes EsLint and EditorConfig rules applying */
  skipLinter: boolean;
}
