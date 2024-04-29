import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {from, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {fromApiEffectSwitchMap} from '@o3r/core';
import {
  cancelContactRequest,
  failContactEntities,
  setContactEntities, setContactEntitiesFromApi,
  updateContactEntities, updateContactEntitiesFromApi,
  upsertContactEntities, upsertContactEntitiesFromApi
} from './contact.actions';

/**
 * Service to handle async Contact actions
 */
@Injectable()
export class ContactEffect {

  /**
   * Set the entities with the reply content, dispatch failContactEntities if it catches a failure
   */
  public setEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setContactEntitiesFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setContactEntities({entities: reply, requestId: action.requestId}),
        (error, action) => of(failContactEntities({error, requestId: action.requestId})),
        cancelContactRequest
      )
    )
  );

  /**
   * Update the entities with the reply content, dispatch failContactEntities if it catches a failure
   */
  public updateEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateContactEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateContactEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failContactEntities({ids: payload.ids, error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  /**
   * Upsert the entities with the reply content, dispatch failContactEntities if it catches a failure
   */
  public upsertEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(upsertContactEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => upsertContactEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failContactEntities({error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {
  }
}
