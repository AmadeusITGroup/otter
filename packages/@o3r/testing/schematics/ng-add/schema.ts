import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Testing framework */
  testingFramework?: 'jest' | 'other';

  /** Enable playwright */
  enablePlaywright: boolean;

  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;
}
