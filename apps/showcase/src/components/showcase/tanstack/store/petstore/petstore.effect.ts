import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {from, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {fromApiEffectSwitchMap} from '@o3r/core';
import {
  cancelPetstoreRequest,
  failPetstoreEntities,
  setPetstoreEntities, setPetstoreEntitiesFromApi,
  setPetstoreEntityFromApi,
  updatePetstoreEntities, updatePetstoreEntitiesFromApi,
  upsertPetstoreEntities, upsertPetstoreEntitiesFromApi
} from './petstore.actions';

/**
 * Service to handle async Petstore actions
 */
@Injectable()
export class PetstoreEffect {

  /**
   * Set the entities with the reply content, dispatch failPetstoreEntities if it catches a failure
   */
  public setEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPetstoreEntitiesFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setPetstoreEntities({entities: reply, requestId: action.requestId}),
        (error, action) => of(failPetstoreEntities({error, requestId: action.requestId})),
        cancelPetstoreRequest
      )
    )
  );

  /**
   * Update the entities with the reply content, dispatch failPetstoreEntities if it catches a failure
   */
  public updateEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePetstoreEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updatePetstoreEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failPetstoreEntities({ids: payload.ids, error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  /**
   * Update the entities with the reply content, dispatch failPetstoreEntities if it catches a failure
   */
  public updateEntityFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPetstoreEntityFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => upsertPetstoreEntities({entities: [reply], requestId: payload.requestId})),
          catchError((err) => of(failPetstoreEntities({error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  /**
   * Upsert the entities with the reply content, dispatch failPetstoreEntities if it catches a failure
   */
  public upsertEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(upsertPetstoreEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => upsertPetstoreEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failPetstoreEntities({error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {
  }
}
