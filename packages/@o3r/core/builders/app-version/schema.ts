import type {JsonObject} from '@angular-devkit/core';

/** Set the app version */
export interface AppVersionBuilderSchema extends JsonObject {
  /** String to be replaced by the version */
  versionToReplace: string;

  /** File where to replace the version */
  file: string;
}
