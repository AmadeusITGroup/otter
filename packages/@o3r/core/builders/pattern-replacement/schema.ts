import type {
  JsonObject
} from '@angular-devkit/core';

/** Replace a given pattern in a list of files */
export interface PatternReplacementBuilderSchema extends JsonObject {
  /** File where to replace the pattern */
  files: string[];
  /** Pattern that will be replaced  */
  searchValue: string;
  /** A string containing the text to replace for every successful match of searchValue in this string. */
  replaceValue: string;
}
