import {
  v4,
} from 'uuid';
import {
  isAsyncRequest,
} from './async.helpers';
import {
  AsyncRequest,
} from './async.interfaces';

/**
 * Returns a creator that makes sure that requestId is defined in the action's properties by generating one
 * if needed.
 */
export const asyncProps = <P extends object>(): (props: P) => P & AsyncRequest => {
  return (props: P) => isAsyncRequest(props) ? props : { ...props, requestId: v4() };
};
