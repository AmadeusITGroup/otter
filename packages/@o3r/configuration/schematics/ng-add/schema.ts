import type {
  NgAddOptions,
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends NgAddOptions, SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;
}
