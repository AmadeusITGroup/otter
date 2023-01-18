import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {BaseRouterStoreState, ROUTER_NAVIGATED, ROUTER_REQUEST, RouterRequestAction} from '@ngrx/router-store';
import {clearRoutingGuardEntities} from '../routing-guard.actions';
import {filter, map} from 'rxjs/operators';

/**
 * Effect to react on Ngrx router store actions
 */
@Injectable()
export class NgrxStoreRouterEffect {

  /**
   * Clear Router registrations when the active history entry changes (ex : click on back/next button Action)
   */
  public resetRouterRegistrationOnRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_REQUEST),
      filter((action: RouterRequestAction<BaseRouterStoreState>) => action.payload.event.navigationTrigger === 'popstate'),
      map(() => clearRoutingGuardEntities())
    )
  );

  /**
   * Clear Router registrations when navigation happened
   */
  public resetRouterRegistrationOnNavigated$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      map(() => clearRoutingGuardEntities())
    )
  );

  constructor(protected actions$: Actions) {
  }
}
