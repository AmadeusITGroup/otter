import type {
  JsonObject,
} from '@angular-devkit/core';

export interface MultiWatcherBuilderSchema extends JsonObject {

  /** List of target with watch options. */
  targets: string[];
}
