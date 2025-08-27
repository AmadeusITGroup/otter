import {createAction, props} from '@ngrx/store';
import {<%= storeName %>State} from './<%= fileName %>.state';

/** StateDetailsActions */
const ACTION_SET = '[<%= storeName %>] set';
const ACTION_UPDATE = '[<%= storeName %>] update';
const ACTION_RESET = '[<%= storeName %>] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const set<%= storeName %> = createAction(ACTION_SET, props<{ model: <%= storeName %>State }>());

/**
 * Change a part or the whole object in the store.
 */
export const update<%= storeName %> = createAction(ACTION_UPDATE, props<Partial<{ model: <%= storeName %>State }>>());

/**
 * Clear the whole state, return to the initial one
 */
export const reset<%= storeName %> = createAction(ACTION_RESET);
