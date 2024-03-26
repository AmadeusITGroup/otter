import { Action } from '@ngrx/store';
import { BehaviorSubject, EMPTY, from, identity, isObservable, merge, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, delay, filter, finalize, pairwise, startWith, switchMap, tap } from 'rxjs/operators';
import { isIdentifiedCallAction } from './async.helpers';
import { AsyncRequest, ExtractFromApiActionPayloadType, FromApiActionPayload } from './async.interfaces';


/**
 * Custom operator to use instead of SwitchMap with effects based on FromApi actions.
 * It makes sure to emit an action when the inner subscription is unsubscribed in order to keep the store up-to-date with pending information.
 * @param successHandler function that returns the action to emit in case the FromApi call is a success
 * @param errorHandler function that returns the action to emit in case the FromApi call fails
 * @param cancelRequestActionFactory function that returns the action to emit in case the FromApi action is 'cancelled' because a new action was received by the switchMap
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function fromApiEffectSwitchMap<T extends FromApiActionPayload<any>, S extends ExtractFromApiActionPayloadType<T>, U extends Action, V extends Action, W extends Action>(
    successHandler: (result: S, action: T) => U | Observable<U> | Promise<Observable<U> | U>,
    errorHandler?: (error: any, action: T) => Observable<V>,
    cancelRequestActionFactory?: (props: AsyncRequest, action: T) => W): OperatorFunction<T, U | V | W> {

  const pendingRequestIdsContext: Record<string, boolean> = {};

  return (source$) => source$.pipe(
    tap((action) => {
      if (isIdentifiedCallAction(action)) {
        pendingRequestIdsContext[action.requestId] = true;
      }
    }),
    startWith(undefined),
    pairwise(),
    switchMap(([previousAction, action]) => {
      if (!action) {
        return EMPTY;
      }
      const isPreviousActionStillRunning = isIdentifiedCallAction(previousAction) && pendingRequestIdsContext[previousAction.requestId];
      const cleanStack = () => {
        if (isIdentifiedCallAction(action)) {
          delete pendingRequestIdsContext[action.requestId];
        }
      };
      return from(action.call).pipe(
        tap(cleanStack),
        switchMap((result) => {
          const sucessPromise = Promise.resolve(successHandler(result, action));
          return from(sucessPromise).pipe(
            switchMap((success) => isObservable(success) ? success : of(success))
          );
        }),
        catchError((error) => {
          cleanStack();
          return errorHandler?.(error, action) || EMPTY;
        }),
        isPreviousActionStillRunning && cancelRequestActionFactory ? startWith(cancelRequestActionFactory({requestId: previousAction.requestId}, action)) : identity
      );
    })
  );
}

/**
 * @param successHandler
 * @param errorHandler
 * @param cancelRequestActionFactory
 * @param cleanUpTimer
 */
export function fromApiEffectSwitchMapById<T extends FromApiActionPayload<any> & { id: string },
  S extends ExtractFromApiActionPayloadType<T>,
  U extends Action,
  V extends Action,
  W extends Action>(
  successHandler: (result: S, action: T) => U | Observable<U> | Promise<Observable<U> | U>,
  errorHandler?: (error: any, action: T) => Observable<V>,
  cancelRequestActionFactory?: (props: AsyncRequest, action: T) => W,
  cleanUpTimer?: number
): OperatorFunction<T, U | V | W> {
  const innerSourcesById: Record<string, [Subject<any>, Observable<any>]> = {};
  return (source$: Observable<T>) => {
    return source$.pipe(
      filter((action: T) => {
        if (!isIdentifiedCallAction(action) || !action.id) {
          return false;
        }
        if (isIdentifiedCallAction(action) && innerSourcesById[action.id]) {
          innerSourcesById[action.id][0].next(action);
          return false;
        }
        return true;
      }),
      switchMap((action: T) => {
        const newIdSubject = new BehaviorSubject(action);
        const newId$ = newIdSubject.pipe(
          fromApiEffectSwitchMap(
            successHandler,
            errorHandler,
            cancelRequestActionFactory
          )
        );
        innerSourcesById[action.id] = [newIdSubject, newId$];
        if (cleanUpTimer !== undefined) {
          newIdSubject.pipe(
            switchMap((myAction) => from(myAction.call).pipe(
              delay(cleanUpTimer),
              finalize(() => {
                delete innerSourcesById[myAction.id];
                newIdSubject.complete();
              })
            ))
          ).subscribe();
        }
        const streams = Object.values(innerSourcesById).map(([_, obs]) => obs);
        return merge(...streams);
      })
    );
  };
}
