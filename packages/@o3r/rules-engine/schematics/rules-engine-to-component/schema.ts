import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgGenerateRulesEngineToComponentSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Path to the component */
  path: string;

  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;
}
