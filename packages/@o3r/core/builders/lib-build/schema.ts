import type {
  JsonObject,
} from '@angular-devkit/core';

/** Library builder */
export interface LibraryBuilderSchema extends JsonObject {
  /** The target build to launch. */
  target: string;

  /**
   * Skip the workaround for the Jasmine fixture issue
   * @default false
   */
  skipJasmineFixtureWorkaround: boolean;
}
