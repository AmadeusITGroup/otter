import {
  AsyncRequest,
  FromApiActionPayload
} from './async.interfaces';

/**
 * Determine if the action is an AsyncRequest action
 * @param action Redux Action
 */
export function isCallAction<T = any>(action?: any): action is FromApiActionPayload<T> {
  if (!action) {
    return false;
  }

  return !!action.call && action.call instanceof Promise;
}

/**
 * Determine if the action is an AsyncRequest action with a Request ID
 * @param action Redux Action
 */
export function isIdentifiedCallAction<T = any>(action?: any): action is FromApiActionPayload<T> & AsyncRequest {
  return isCallAction(action) && typeof action.requestId !== 'undefined';
}

/**
 * Determine if the given item implements the AsyncRequest interface
 * @param item
 */
export function isAsyncRequest<T>(item: any): item is T & AsyncRequest {
  return typeof item.requestId !== 'undefined';
}
