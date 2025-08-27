import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddLocalizationKeySchematicsSchema extends SchematicOptionObject {
  /** Path to the component */
  path: string;

  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /** Localization key without the component prefix */
  key: string;

  /** Description of the localization */
  description?: string | undefined;

  /** Default value of the localization */
  value: string;

  /** Is a dictionary key */
  dictionary: boolean;

  /** Update the template by replacing matching value by the localization key */
  updateTemplate?: boolean | undefined;
}
