import type {
  JsonObject,
} from '@angular-devkit/core';

/** Combine the local migration scripts of the current project with all the migration scripts of its dependencies. */
export type AggregateMigrationScriptsSchema = JsonObject & {
  /** Glob of the migration files to use. */
  migrationDataPath: string | string[];

  /** Path where the aggregated migration files should be written. */
  outputDirectory: string;

  /**
   * Optional path where the libraries can be found
   * @default module.paths
   */
  librariesDirectory?: string;
};
