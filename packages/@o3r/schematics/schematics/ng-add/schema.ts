import type {
  NgAddOptions,
  SchematicOptionObject,
} from '../../src/public_api';

export interface NgAddSchematicsSchema extends Omit<NgAddOptions, 'skipInstall'>, SchematicOptionObject {}
