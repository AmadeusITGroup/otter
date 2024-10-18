import type {
  SchematicOptionObject
} from '@o3r/schematics';
import {
  MethodType
} from './models';

export interface NgAddFunctionsToFixtureSchematicsSchema extends SchematicOptionObject {
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
