import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { PetEffect } from './pet.effect';
import { petReducer } from './pet.reducer';
import { PET_STORE_NAME, PetState } from './pet.state';

/** Token of the Pet reducer */
export const PET_REDUCER_TOKEN = new InjectionToken<ActionReducer<PetState, Action>>('Feature Pet Reducer');

/** Provide default reducer for Pet store */
export function getDefaultPetReducer() {
  return petReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(PET_STORE_NAME, PET_REDUCER_TOKEN), EffectsModule.forFeature([PetEffect])
  ],
  providers: [
    { provide: PET_REDUCER_TOKEN, useFactory: getDefaultPetReducer }
  ]
})
export class PetStoreModule {
  public static forRoot<T extends PetState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<PetStoreModule> {
    return {
      ngModule: PetStoreModule,
      providers: [
        { provide: PET_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
