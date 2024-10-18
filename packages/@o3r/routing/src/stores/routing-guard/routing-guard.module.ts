import {
  InjectionToken,
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import {
  Action,
  ActionReducer,
  StoreModule
} from '@ngrx/store';
import {
  routingGuardReducer
} from './routing-guard.reducer';
import {
  ROUTING_GUARD_STORE_NAME,
  RoutingGuardState
} from './routing-guard.state';

/** Token of the RoutingGuard reducer */
export const ROUTING_GUARD_REDUCER_TOKEN = new InjectionToken<ActionReducer<RoutingGuardState, Action>>('Feature RoutingGuard Reducer');

/** Provide default reducer for RoutingGuard store */
export function getDefaultRoutingGuardReducer() {
  return routingGuardReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ROUTING_GUARD_STORE_NAME, ROUTING_GUARD_REDUCER_TOKEN)
  ],
  providers: [
    { provide: ROUTING_GUARD_REDUCER_TOKEN, useFactory: getDefaultRoutingGuardReducer }
  ]
})
export class RoutingGuardStoreModule {
  public static forRoot<T extends RoutingGuardState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<RoutingGuardStoreModule> {
    return {
      ngModule: RoutingGuardStoreModule,
      providers: [
        { provide: ROUTING_GUARD_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
