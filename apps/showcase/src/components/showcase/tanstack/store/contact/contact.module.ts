import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { ContactEffect } from './contact.effect';
import { contactReducer } from './contact.reducer';
import { CONTACT_STORE_NAME, ContactState } from './contact.state';

/** Token of the Contact reducer */
export const CONTACT_REDUCER_TOKEN = new InjectionToken<ActionReducer<ContactState, Action>>('Feature Contact Reducer');

/** Provide default reducer for Contact store */
export function getDefaultContactReducer() {
  return contactReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(CONTACT_STORE_NAME, CONTACT_REDUCER_TOKEN), EffectsModule.forFeature([ContactEffect])
  ],
  providers: [
    { provide: CONTACT_REDUCER_TOKEN, useFactory: getDefaultContactReducer }
  ]
})
export class ContactStoreModule {
  public static forRoot<T extends ContactState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<ContactStoreModule> {
    return {
      ngModule: ContactStoreModule,
      providers: [
        { provide: CONTACT_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
