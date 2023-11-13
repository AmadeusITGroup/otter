import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {from, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {fromApiEffectSwitchMap} from '@o3r/core';
import {
  cancelPetRequest,
  failPetEntities,
  removePetEntities,
  removePetEntitiesFromApi,
  setPetEntities, setPetEntitiesFromApi,
  updatePetEntities, updatePetEntitiesFromApi,
  upsertPetEntities, upsertPetEntitiesFromApi
} from './pet.actions';

/**
 * Service to handle async Pet actions
 */
@Injectable()
export class PetEffect {

  /**
   * Set the entities with the reply content, dispatch failPetEntities if it catches a failure
   */
  public setEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPetEntitiesFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setPetEntities({entities: reply, requestId: action.requestId}),
        (error, action) => of(failPetEntities({error, requestId: action.requestId})),
        cancelPetRequest
      )
    )
  );

  /**
   * Update the entities with the reply content, dispatch failPetEntities if it catches a failure
   */
  public updateEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePetEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updatePetEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failPetEntities({ids: payload.ids, error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  /**
   * Upsert the entities with the reply content, dispatch failPetEntities if it catches a failure
   */
  public upsertEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(upsertPetEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => upsertPetEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failPetEntities({error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  /**
   * Remove the entities with the reply content, dispatch failPetEntities if it catches a failure
   */
  public removeEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removePetEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => removePetEntities({ ids: reply, requestId: payload.requestId})),
          catchError((err) => of(failPetEntities({error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {
  }
}
