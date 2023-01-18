export const commonModuleContent = `import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { AirOffersEffect } from './air-offers.effect';
import { airOffersReducer } from './air-offers.reducer';
import { AIR_OFFERS_STORE_NAME, AirOffersState } from './air-offers.state';

/** Token of the AirOffers reducer */
export const AIR_OFFERS_REDUCER_TOKEN = new InjectionToken<ActionReducer<AirOffersState, Action>>('Feature AirOffers Reducer');

/** Provide default reducer for AirOffers store */
export function getDefaultAirOffersReducer() {
  return airOffersReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(AIR_OFFERS_STORE_NAME, AIR_OFFERS_REDUCER_TOKEN), EffectsModule.forFeature([AirOffersEffect])
],
providers: [
  { provide: AIR_OFFERS_REDUCER_TOKEN, useFactory: getDefaultAirOffersReducer }
]
})
export class AirOffersStoreModule {
public static forRoot<T extends AirOffersState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<AirOffersStoreModule> {
    return {
      ngModule: AirOffersStoreModule,
      providers: [
        { provide: AIR_OFFERS_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}

`;
