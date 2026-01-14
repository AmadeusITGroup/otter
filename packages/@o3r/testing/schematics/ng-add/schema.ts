import type {
  NgAddOptions,
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends NgAddOptions, SchematicOptionObject {
  /** Testing framework */
  testingFramework?: 'jest' | 'vitest' | 'other';

  /** Enable playwright */
  enablePlaywright: boolean;
}
