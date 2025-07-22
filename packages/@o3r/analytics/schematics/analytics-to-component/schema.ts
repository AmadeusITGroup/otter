import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddAnalyticsSchematicsSchema extends SchematicOptionObject {
  /** Path to the component */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Determine if the dummy analytics events should be generated */
  activateDummy: boolean;
}
