import {
  NgGenerateCommonStoreSchematicsSchema
} from '../common/schema';

/**
 * Properties associated to an Otter entity sync store
 */
export interface NgGenerateEntitySyncStoreSchematicsSchema extends NgGenerateCommonStoreSchematicsSchema {
  /** The property name that identifies the model */
  modelIdPropName: string;
}
