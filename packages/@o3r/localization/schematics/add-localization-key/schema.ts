import type { JsonObject } from '@angular-devkit/core';

export interface NgAddLocalizationKeySchematicsSchema extends JsonObject {
  /** Path to the component */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Localization key without the component prefix */
  key: string;

  /** Description of the localization */
  description: string | null;

  /** Default value of the localization */
  value: string;

  /** Is a dictionnary key */
  dictionnary: boolean;
}
