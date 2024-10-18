import type {
  SchematicOptionObject
} from '@o3r/schematics';
import {
  NgGenerateEntityAsyncStoreSchematicsSchema
} from './entity-async/schema';
import {
  NgGenerateEntitySyncStoreSchematicsSchema
} from './entity-sync/schema';
import {
  NgGenerateSimpleAsyncStoreSchematicsSchema
} from './simple-async/schema';
import {
  NgGenerateSimpleSyncStoreSchematicsSchema
} from './simple-sync/schema';

/**
 * Base properties associated to an Otter store
 */
export interface NgGenerateStoreBaseSchematicsSchema extends SchematicOptionObject {
  /** Directory containing the stores */
  path?: string | undefined;

  /** Project name */
  projectName?: string | undefined;

  /** Store name */
  storeType: 'entity-async' | 'simple-async' | 'entity-sync' | 'simple-sync';

  /** Skip the linter process */
  skipLinter: boolean;
}

type Nullable<T> = { [P in keyof T]: T[P] | undefined };

/**
 * Properties associated to an Otter store
 */
export type NgGenerateStoreSchematicsSchema = NgGenerateStoreBaseSchematicsSchema &
  Nullable<NgGenerateEntityAsyncStoreSchematicsSchema> &
  Nullable<NgGenerateSimpleAsyncStoreSchematicsSchema> &
  Nullable<NgGenerateEntitySyncStoreSchematicsSchema> &
  Nullable<NgGenerateSimpleSyncStoreSchematicsSchema>;
