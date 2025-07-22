import type {
  JsonObject,
} from '@angular-devkit/core';

export interface RulesEngineExtractorBuilderSchema extends JsonObject {

  /** Typescript configuration file to build the application */
  tsConfig: string;

  /** List of libraries imported */
  libraries: string[];

  /** Path to directory to output the facts metadata file, default : dist */
  outputFactsDirectory: string;

  /** Path to the directory to output the operators metadata file, default: dist */
  outputOperatorsDirectory: string;

  /** List of patterns of the source files containing the facts definitions */
  factFilePatterns: string[];

  /** List of patterns of the source files containing the operators definitions */
  operatorFilePatterns: string[];

  /** Will ignore all facts coming from the libraries listed */
  ignoreFactsFromLibraries: string[];
}
