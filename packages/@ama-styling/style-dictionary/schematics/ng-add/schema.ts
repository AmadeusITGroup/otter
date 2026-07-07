import type {
  NgAddOptions,
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends NgAddOptions, SchematicOptionObject {
  /** Generate config file with the default extension .js instead of .mjs */
  useJsExt?: boolean;
}
