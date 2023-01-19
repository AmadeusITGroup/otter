export const syncEntityStateContent = `import {Example} from '@api/sdk';
import {EntityState} from '@ngrx/entity';

/**
 * Example model
 */
export interface ExampleModel  extends Example  {

}

/**
 * Example state details
 */
export interface ExampleStateDetails {}

/**
 * Example store state
 */
export interface ExampleState extends EntityState<ExampleModel>, ExampleStateDetails {}

/**
 * Name of the Example Store
 */
export const EXAMPLE_STORE_NAME = 'example';

/**
 * Example Store Interface
 */
export interface ExampleStore {
  /** Example state */
  [EXAMPLE_STORE_NAME]: ExampleState;
}
`;
