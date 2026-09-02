import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  Action,
  ActionReducer,
  provideState,
  StoreModule,
} from '@ngrx/store';
import {
  placeholderTemplateReducer,
} from './placeholder-template.reducer';
import {
  PLACEHOLDER_TEMPLATE_STORE_NAME,
  PlaceholderTemplateState,
} from './placeholder-template.state';

/** Token of the PlaceholderTemplate reducer */
export const PLACEHOLDER_TEMPLATE_REDUCER_TOKEN = new InjectionToken<ActionReducer<PlaceholderTemplateState, Action>>('Feature PlaceholderTemplate Reducer');

/** Provide default reducer for PlaceholderTemplate store */
export function getDefaultPlaceholderTemplateReducer() {
  return placeholderTemplateReducer;
}

/**
 * @deprecated Will be removed in v16. Use {@link providePlaceholderTemplateStore} instead.
 */
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

/**
 * Provide PlaceholderTemplate feature store.
 * @param reducerFactory Optional factory to override the default reducer.
 */
export function providePlaceholderTemplateStore(reducerFactory?: () => ActionReducer<PlaceholderTemplateState, Action>): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(PLACEHOLDER_TEMPLATE_STORE_NAME, reducerFactory ? reducerFactory() : placeholderTemplateReducer)
  ]);
}
