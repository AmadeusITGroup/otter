import {
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  Action,
  ActionReducer,
  StoreModule,
} from '@ngrx/store';
import {
  placeholderRequestReducer,
} from './placeholder-request.reducer';
import {
  PLACEHOLDER_REQUEST_STORE_NAME,
  PlaceholderRequestState,
} from './placeholder-request.state';

/** Token of the PlaceholderRequest reducer */
export const PLACEHOLDER_REQUEST_REDUCER_TOKEN = new InjectionToken<ActionReducer<PlaceholderRequestState, Action>>('Feature PlaceholderRequest Reducer');

/** Provide default reducer for PlaceholderRequest store */
export function getDefaultplaceholderRequestReducer() {
  return placeholderRequestReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(PLACEHOLDER_REQUEST_STORE_NAME, PLACEHOLDER_REQUEST_REDUCER_TOKEN)
  ],
  providers: [
    { provide: PLACEHOLDER_REQUEST_REDUCER_TOKEN, useFactory: getDefaultplaceholderRequestReducer }
  ]
})
export class PlaceholderRequestStoreModule {
  public static forRoot<T extends PlaceholderRequestState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<PlaceholderRequestStoreModule> {
    return {
      ngModule: PlaceholderRequestStoreModule,
      providers: [
        { provide: PLACEHOLDER_REQUEST_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
