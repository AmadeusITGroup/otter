export const asyncSimpleActionsContent = `import {asyncProps, AsyncRequest, FromApiActionPayload, WithRequestId} from '@o3r/core';
import {Example} from '@api/sdk';
import {createAction, props} from '@ngrx/store';
import {ExampleModel} from './example.state';

/** StateDetailsActions */
const ACTION_SET = '[Example] set';
const ACTION_UPDATE = '[Example] update';
const ACTION_RESET = '[Example] reset';
const ACTION_FAIL = '[Example] fail';
const ACTION_CANCEL_REQUEST = '[Example] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[Example] set from api';
const ACTION_UPDATE_FROM_API = '[Example] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setExample = createAction(ACTION_SET, props<WithRequestId<ExampleModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateExample = createAction(ACTION_UPDATE, props<WithRequestId<Partial<ExampleModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetExample = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelExampleRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
export const failExample = createAction(ACTION_FAIL, props<WithRequestId<{error: any}>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setExampleFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<Example>>());

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateExampleFromApi = createAction(ACTION_UPDATE_FROM_API, asyncProps<FromApiActionPayload<Example>>());

`;
