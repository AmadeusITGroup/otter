import type { SchematicOptionObject } from '@o3r/schematics';

/**
 * Properties associated to an Otter simple sync store
 */
export interface NgGenerateSimpleSyncStoreSchematicsSchema extends SchematicOptionObject {
  /** Directory containing the stores */
  path: string | undefined;

  /** Project name */
  projectName: string | undefined;

  /** Store name */
  storeName: string;

  /** Skip the linter process */
  skipLinter: boolean;
}
