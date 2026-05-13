import type {
  SchematicOptionObject,
} from '@o3r/schematics';

/**
 * Migration options for transforming from \@o3r/localization to \@o3r/transloco
 */
export interface MigrationLocalizationToTranslocoSchema extends SchematicOptionObject {
  /** Skip npm/yarn install after migration */
  skipInstall?: boolean;
  /** Skip running lint --fix after migration */
  skipLinter?: boolean;
  /** Preview changes without applying them */
  dryRun?: boolean;
  /** Show detailed transformation logs */
  verbose?: boolean;
}
