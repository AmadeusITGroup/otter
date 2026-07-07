import type {
  NgAddOptions,
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends NgAddOptions, SchematicOptionObject {
  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /**
   * Skip the code sample generated in application to register the ApiManager
   * If `false`, a dependency to @ama-sdk/client-fetch will be added
   */
  skipCodeSample?: boolean;
}
