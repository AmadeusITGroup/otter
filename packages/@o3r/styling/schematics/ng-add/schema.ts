import type {
  NgAddOptions,
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends NgAddOptions, SchematicOptionObject {
  /** Activate metadata extraction */
  enableMetadataExtract: boolean;
}
