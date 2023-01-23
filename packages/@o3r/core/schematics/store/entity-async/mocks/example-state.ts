export const asyncEntityStateContent = `import {Example} from '@api/sdk';
import {EntityState} from '@ngrx/entity';
import {AsyncStoreItem} from '@o3r/core';

/**
 * Example model
 */
export interface ExampleModel extends AsyncStoreItem, Example {

}

/**
 * Example state details
 */
export interface ExampleStateDetails extends AsyncStoreItem {}

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
