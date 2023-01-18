export const asyncEntityEffectContent = `import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {from, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {fromApiEffectSwitchMap} from '@o3r/core';
import {
  cancelAirOffersRequest,
  failAirOffersEntities,
  setAirOffersEntities, setAirOffersEntitiesFromApi,
  updateAirOffersEntities, updateAirOffersEntitiesFromApi,
  upsertAirOffersEntities, upsertAirOffersEntitiesFromApi
} from './air-offers.actions';

/**
 * Service to handle async AirOffers actions
 */
@Injectable()
export class AirOffersEffect {

  /**
   * Set the entities with the reply content, dispatch failAirOffersEntities if it catches a failure
   */
  public setEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setAirOffersEntitiesFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setAirOffersEntities({entities: reply, requestId: action.requestId}),
        (error, action) => of(failAirOffersEntities({error, requestId: action.requestId})),
        cancelAirOffersRequest
      )
    )
  );

  /**
   * Update the entities with the reply content, dispatch failAirOffersEntities if it catches a failure
   */
  public updateEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAirOffersEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateAirOffersEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failAirOffersEntities({ids: payload.ids, error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  /**
   * Upsert the entities with the reply content, dispatch failAirOffersEntities if it catches a failure
   */
  public upsertEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(upsertAirOffersEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => upsertAirOffersEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failAirOffersEntities({error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {
  }
}

`;
