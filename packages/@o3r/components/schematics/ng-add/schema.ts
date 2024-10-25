import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Activate metadata extraction */
  enableMetadataExtract: boolean;

  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;
}
