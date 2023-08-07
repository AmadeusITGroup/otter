import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgAddLocalizationKeySchematicsSchema extends SchematicOptionObject {
  /** Path to the component */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Localization key without the component prefix */
  key: string;

  /** Description of the localization */
  description?: string | undefined;

  /** Default value of the localization */
  value: string;

  /** Is a dictionnary key */
  dictionnary: boolean;
}
