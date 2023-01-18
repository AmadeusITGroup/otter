import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {from, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {fromApiEffectSwitchMap} from '@o3r/core';
import {
  cancelShoppingCartRequest,
  failShoppingCartEntities,
  setShoppingCartEntities, setShoppingCartEntitiesFromApi,
  updateShoppingCartEntities, updateShoppingCartEntitiesFromApi,
  upsertShoppingCartEntities, upsertShoppingCartEntitiesFromApi
} from './shopping-cart.actions';

/**
 * Service to handle async ShoppingCart actions
 */
@Injectable()
export class ShoppingCartEffect {

  /**
   * Set the entities with the reply content, dispatch failShoppingCartEntities if it catches a failure
   */
  public setEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setShoppingCartEntitiesFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setShoppingCartEntities({entities: reply, requestId: action.requestId}),
        (error, action) => of(failShoppingCartEntities({error, requestId: action.requestId})),
        cancelShoppingCartRequest
      )
    )
  );

  /**
   * Update the entities with the reply content, dispatch failShoppingCartEntities if it catches a failure
   */
  public updateEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateShoppingCartEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateShoppingCartEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failShoppingCartEntities({ids: payload.ids, error: err,  requestId: payload.requestId})))
        )
      )
    )
  );

  /**
   * Upsert the entities with the reply content, dispatch failShoppingCartEntities if it catches a failure
   */
  public upsertEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(upsertShoppingCartEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => upsertShoppingCartEntities({entities: reply, requestId: payload.requestId})),
          catchError((err) => of(failShoppingCartEntities({error: err,  requestId: payload.requestId})))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {
  }
}
