export const asyncSimpleEffectContent = `import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {from, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {fromApiEffectSwitchMap} from '@o3r/core';
import {
  cancelAirOffersRequest,
  failAirOffers,
  setAirOffers, setAirOffersFromApi,
  updateAirOffers, updateAirOffersFromApi
} from './air-offers.actions';

/**
 * Service to handle async AirOffers actions
 */
@Injectable()
export class AirOffersEffect {
  /**
   * Set the state with the reply content, dispatch failAirOffers if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setAirOffersFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setAirOffers({model: reply, requestId: action.requestId}),
        (error, action) => of(failAirOffers({error, requestId: action.requestId})),
        cancelAirOffersRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failAirOffers if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAirOffersFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateAirOffers({model: reply, requestId: payload.requestId})),
          catchError((err) => of(failAirOffers({error: err, requestId: payload.requestId})))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}

`;
