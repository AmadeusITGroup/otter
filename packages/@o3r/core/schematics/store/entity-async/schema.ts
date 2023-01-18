import { NgGenerateCommonStoreSchematicsSchema } from '../common/schema';

/**
 * Properties associated to an Otter entity async store
 */
export interface NgGenerateEntityAsyncStoreSchematicsSchema extends NgGenerateCommonStoreSchematicsSchema {
  /** The property name that identifies the model */
  modelIdPropName: string;

  /** Test framework used */
  testFramework: 'jest' | 'jasmine';
}
