export const syncSimpleStateContent = `/**
 * Example store state
 */
export interface ExampleState {}

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
