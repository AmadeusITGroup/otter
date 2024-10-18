import type {
  SchematicOptionObject
} from '../../src/public_api';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;
}
