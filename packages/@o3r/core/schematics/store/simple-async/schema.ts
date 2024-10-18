import {
  NgGenerateCommonStoreSchematicsSchema
} from '../common/schema';

/**
 * Properties associated to an Otter simple async store
 */
export interface NgGenerateSimpleAsyncStoreSchematicsSchema extends NgGenerateCommonStoreSchematicsSchema {
  /** Test framework used */
  testFramework: 'jest' | 'jasmine';
}
