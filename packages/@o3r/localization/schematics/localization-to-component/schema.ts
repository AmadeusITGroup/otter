import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgAddLocalizationSchematicsSchema extends SchematicOptionObject {
  /** Path to the component */
  path: string;

  /** Path to spec file of the component */
  specFilePath?: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Determine if the dummy localization should be generated */
  activateDummy: boolean;
}
