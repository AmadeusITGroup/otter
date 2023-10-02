import type { SchematicOptionObject } from '@o3r/schematics';

export interface EslintSchematicsSchema extends SchematicOptionObject {
  /** List of files to be lint, files should be comma separated */
  files: string | string[];
  /** Indicates if the linter process should succeed even if there are lint errors remaining */
  continueOnError: boolean;
  /** If enabled, only errors are reported (--quiet option of ESLint CLI) */
  hideWarnings: boolean;
  /** Linter configuration file path */
  configFile?: string;
}
