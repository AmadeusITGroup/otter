import {
  Injectable
} from '@angular/core';
import {
  Actions,
  createEffect,
  ofType
} from '@ngrx/effects';
import {
  fromApiEffectSwitchMap
} from '@o3r/core';
import {
  from,
  of
} from 'rxjs';
import {
  catchError,
  map,
  mergeMap
} from 'rxjs/operators';
import {
  cancelRulesetsRequest,
  failRulesetsEntities,
  setRulesetsEntities,
  setRulesetsEntitiesFromApi,
  upsertRulesetsEntities,
  upsertRulesetsEntitiesFromApi
} from './rulesets.actions';

/**
 * Service to handle async Rulesets actions
 */
@Injectable()
export class RulesetsEffect {
  /**
   * Set the entities with the reply content, dispatch failRulesetsEntities if it catches a failure
   */
  public setEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setRulesetsEntitiesFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setRulesetsEntities({ entities: reply, requestId: action.requestId }),
        (error, action) => of(failRulesetsEntities({ error, requestId: action.requestId })),
        cancelRulesetsRequest
      )
    )
  );

  /**
   * Upsert the entities with the reply content, dispatch failRulesetsEntities if it catches a failure
   */
  public upsertEntitiesFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(upsertRulesetsEntitiesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => upsertRulesetsEntities({ entities: reply, requestId: payload.requestId })),
          catchError((err) => of(failRulesetsEntities({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
