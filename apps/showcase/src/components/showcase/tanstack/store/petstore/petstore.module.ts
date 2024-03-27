import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { PetstoreEffect } from './petstore.effect';
import { petstoreReducer } from './petstore.reducer';
import { PETSTORE_STORE_NAME, PetstoreState } from './petstore.state';

/** Token of the Petstore reducer */
export const PETSTORE_REDUCER_TOKEN = new InjectionToken<ActionReducer<PetstoreState, Action>>('Feature Petstore Reducer');

/** Provide default reducer for Petstore store */
export function getDefaultPetstoreReducer() {
  return petstoreReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(PETSTORE_STORE_NAME, PETSTORE_REDUCER_TOKEN), EffectsModule.forFeature([PetstoreEffect])
  ],
  providers: [
    { provide: PETSTORE_REDUCER_TOKEN, useFactory: getDefaultPetstoreReducer }
  ]
})
export class PetstoreStoreModule {
  public static forRoot<T extends PetstoreState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<PetstoreStoreModule> {
    return {
      ngModule: PetstoreStoreModule,
      providers: [
        { provide: PETSTORE_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
