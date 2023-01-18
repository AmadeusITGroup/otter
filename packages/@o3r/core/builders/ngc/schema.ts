import {JsonObject} from '@angular-devkit/core';

/** Library builder */
export interface NgcBuilderSchema extends JsonObject {
  /** The path to tsconfig file. */
  tsConfig: string;
  /** Enable watch mode. */
  watch: boolean;
}
