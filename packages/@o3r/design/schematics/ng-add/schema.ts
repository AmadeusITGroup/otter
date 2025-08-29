import type {
  NgAddOptions,
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends NgAddOptions, SchematicOptionObject {
  /** Extract the design token from Sass file in the project */
  extractDesignToken?: boolean;
}
