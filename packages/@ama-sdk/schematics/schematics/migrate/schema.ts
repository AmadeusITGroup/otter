/** Migrate Schematics Options */
export interface MigrateSchematicsSchemaOptions {
  /** Starting version from which the migration scripts are executed */
  from: string;
  /** Version of the package to migrate to (will use the current version if not specified) */
  to?: string;
  /** Project name */
  projectName?: string | undefined;
}
