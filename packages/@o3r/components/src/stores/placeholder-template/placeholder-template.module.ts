import {InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {Action, ActionReducer, StoreModule} from '@ngrx/store';

import {placeholderTemplateReducer} from './placeholder-template.reducer';
import {PLACEHOLDER_TEMPLATE_STORE_NAME, PlaceholderTemplateState} from './placeholder-template.state';

/** Token of the PlaceholderTemplate reducer */
export const PLACEHOLDER_TEMPLATE_REDUCER_TOKEN = new InjectionToken<ActionReducer<PlaceholderTemplateState, Action>>('Feature PlaceholderTemplate Reducer');

/** Provide default reducer for PlaceholderTemplate store */
export function getDefaultPlaceholderTemplateReducer() {
  return placeholderTemplateReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(PLACEHOLDER_TEMPLATE_STORE_NAME, PLACEHOLDER_TEMPLATE_REDUCER_TOKEN)
  ],
  providers: [
    { provide: PLACEHOLDER_TEMPLATE_REDUCER_TOKEN, useFactory: getDefaultPlaceholderTemplateReducer }
  ]
})
export class PlaceholderTemplateStoreModule {
  public static forRoot<T extends PlaceholderTemplateState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<PlaceholderTemplateStoreModule> {
    return {
      ngModule: PlaceholderTemplateStoreModule,
      providers: [
        { provide: PLACEHOLDER_TEMPLATE_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
