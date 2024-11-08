import type {
  SchematicOptionObject,
} from '@o3r/schematics';

/**
 * Properties common between the different Otter stores
 */
export interface NgGenerateCommonStoreSchematicsSchema extends SchematicOptionObject {
  /** Directory containing the stores */
  path?: string | undefined;

  /** Project name */
  projectName?: string | undefined;

  /** Store name */
  storeName: string;

  /** Sdk package */
  sdkPackage: string;

  /** The SDK Model to use as store item (e.g. Example) */
  modelName: string;

  /** Skip the linter process */
  skipLinter: boolean;
}
