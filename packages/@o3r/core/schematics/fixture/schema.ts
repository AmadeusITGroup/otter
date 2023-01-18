import { JsonObject } from '@angular-devkit/core';
import { MethodType } from './models';

export interface NgAddFunctionsToFixtureSchematicsSchema extends JsonObject {
  /**
   * Path of the fixture file
   */
  path: string;

  /**
   * List of method types to generate
   */
  methods: MethodType[];

  /**
   * Query selector
   */
  selector: string;

  /** Skip the linter process */
  skipLinter: boolean;
}
