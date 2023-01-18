export const asyncEntityEffectContent = `import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {from, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {fromApiEffectSwitchMap} from '@o3r/core';
import {
  cancelExampleRequest,
  failExampleEntities,
  setExampleEntities, setExampleEntitiesFromApi,
  updateExampleEntities, updateExampleEntitiesFromApi,
  upsertExampleEntities, upsertExampleEntitiesFromApi
} from './example.actions';

/**
 * Service to handle async Example actions
 */
@Injectable()
export class ExampleEffect {

  /**
   * Set the entities with the reply content, dispatch failExampleEntities if it catches a failure
   */
  public setEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setExampleEntitiesFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setExampleEntities({entities: reply, requestId: action.requestId}),
        (error, action) => of(failExampleEntities({error, requestId: action.requestId})),
        cancelExampleRequest
      )
    )
  );

  /**
   * Update the entities with the reply content, dispatch failExampleEntities if it catches a failure
   */
  public updateEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateExampleEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateExampleEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failExampleEntities({ids: payload.ids, error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  /**
   * Upsert the entities with the reply content, dispatch failExampleEntities if it catches a failure
   */
  public upsertEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(upsertExampleEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => upsertExampleEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failExampleEntities({error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {
  }
}

`;
