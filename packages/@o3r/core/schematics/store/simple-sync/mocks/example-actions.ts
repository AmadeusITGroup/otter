export const syncSimpleActionsContent = `import {createAction, props} from '@ngrx/store';
import {ExampleState} from './example.state';

/** StateDetailsActions */
const ACTION_SET = '[Example] set';
const ACTION_UPDATE = '[Example] update';
const ACTION_RESET = '[Example] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setExample = createAction(ACTION_SET, props<{model: ExampleState}>());

/**
 * Change a part or the whole object in the store.
 */
export const updateExample = createAction(ACTION_UPDATE, props<Partial<{model: ExampleState}>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetExample = createAction(ACTION_RESET);

`;
