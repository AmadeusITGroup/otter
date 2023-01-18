import {JsonObject} from '@angular-devkit/core';

/**
 * Properties common between the different Otter stores
 */
export interface NgGenerateCommonStoreSchematicsSchema extends JsonObject {
  /** Directory containing the stores */
  path: string | null;

  /** Project name */
  projectName: string | null;

  /** Store name */
  storeName: string;

  /** Sdk package */
  sdkPackage: string;

  /** The SDK Model to use as store item (e.g. AirOffer) */
  modelName: string;

  /** Skip the linter process */
  skipLinter: boolean;
}
