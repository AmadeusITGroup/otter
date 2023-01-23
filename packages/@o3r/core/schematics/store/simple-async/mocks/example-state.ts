export const asyncSimpleStateContent = `import {AsyncStoreItem} from '@o3r/core';
import {Example} from '@api/sdk';
/**
 * Example model
 */
export interface ExampleModel {
  model: Example | null;
}

/**
 * Example model details
 */
export interface ExampleStateDetails extends AsyncStoreItem {
}

/**
 * Example store state
 */
export interface ExampleState extends ExampleStateDetails, ExampleModel {
}

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
