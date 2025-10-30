import type {
  NgAddOptions,
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends NgAddOptions, SchematicOptionObject {
  /** Fix known issues with our ESLint config after Otter application or library generation */
  fix?: boolean;
  /** Skip the linter process which includes EditorConfig rules applying */
  skipLinter: boolean;
}
