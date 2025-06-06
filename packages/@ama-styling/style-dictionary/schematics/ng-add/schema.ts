import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;
  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;
  /** Generate config file with the default extension .js instead of .mjs */
  useJsExt?: boolean;
}
