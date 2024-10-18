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
  formErrorMessagesReducer
} from './form-error-messages.reducer';
import {
  FORM_ERROR_MESSAGES_STORE_NAME,
  FormErrorMessagesState
} from './form-error-messages.state';

/** Token of the FormErrorMessages reducer */
export const FORM_ERROR_MESSAGES_REDUCER_TOKEN = new InjectionToken<ActionReducer<FormErrorMessagesState, Action>>('Feature FormErrorMessages Reducer');

/** Provide default reducer for FormErrorMessages store */
export function getDefaultFormErrorMessagesReducer() {
  return formErrorMessagesReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(FORM_ERROR_MESSAGES_STORE_NAME, FORM_ERROR_MESSAGES_REDUCER_TOKEN)
  ],
  providers: [
    { provide: FORM_ERROR_MESSAGES_REDUCER_TOKEN, useFactory: getDefaultFormErrorMessagesReducer }
  ]
})
export class FormErrorMessagesStoreModule {
  public static forRoot<T extends FormErrorMessagesState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<FormErrorMessagesStoreModule> {
    return {
      ngModule: FormErrorMessagesStoreModule,
      providers: [
        { provide: FORM_ERROR_MESSAGES_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
