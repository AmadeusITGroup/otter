import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;
  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;
  /** Fix known issues with our ESLint config after Otter application or library generation */
  fix?: boolean;
}
