export const asyncSimpleEffectContent = `import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {from, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {fromApiEffectSwitchMap} from '@o3r/core';
import {
  cancelExampleRequest,
  failExample,
  setExample, setExampleFromApi,
  updateExample, updateExampleFromApi
} from './example.actions';

/**
 * Service to handle async Example actions
 */
@Injectable()
export class ExampleEffect {
  /**
   * Set the state with the reply content, dispatch failExample if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setExampleFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setExample({model: reply, requestId: action.requestId}),
        (error, action) => of(failExample({error, requestId: action.requestId})),
        cancelExampleRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failExample if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateExampleFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateExample({model: reply, requestId: payload.requestId})),
          catchError((err) => of(failExample({error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}

`;
