/** Schematic Option */
export interface MigrateSchematicsSchemaOptions {
  /** Starting version from which executing the migration scripts */
  from: string;
  /** Version of the package to migrate to (will use the current version if not specified) */
  to?: string;
  /** Project name */
  projectName?: string | undefined;
}
