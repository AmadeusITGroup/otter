/**
 * <%= storeName %> store state
 */
export interface <%= storeName %>State {}

/**
 * Name of the <%= storeName %> Store
 */
export const <%= scuStoreName %>_STORE_NAME = '<%= cStoreName %>';

/**
 * <%= storeName %> Store Interface
 */
export interface <%= storeName %>Store {
  /** <%= storeName %> state */
  [<%= scuStoreName %>_STORE_NAME]: <%= storeName %>State;
}
