import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
<%if (isAsync) {%>
import { EffectsModule } from '@ngrx/effects';
import { <%= storeName %>Effect } from './<%= fileName %>.effect';<%}%>
import { <%= cStoreName %>Reducer } from './<%= fileName %>.reducer';
import { <%= scuStoreName %>_STORE_NAME, <%= storeName %>State } from './<%= fileName %>.state';

/** Token of the <%= storeName %> reducer */
export const <%= scuStoreName %>_REDUCER_TOKEN = new InjectionToken<ActionReducer<<%= storeName %>State, Action>>('Feature <%= storeName %> Reducer');

/** Provide default reducer for <%= storeName %> store */
export function getDefault<%= storeName %>Reducer() {
  return <%= cStoreName %>Reducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(<%= scuStoreName %>_STORE_NAME, <%= scuStoreName %>_REDUCER_TOKEN)<%if (isAsync) {%>, EffectsModule.forFeature([<%= storeName %>Effect])<%}%>
  ],
  providers: [
    { provide: <%= scuStoreName %>_REDUCER_TOKEN, useFactory: getDefault<%= storeName %>Reducer }
  ]
})
export class <%= storeName %>StoreModule {
  public static forRoot<T extends <%= storeName %>State>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<<%= storeName %>StoreModule> {
    return {
      ngModule: <%= storeName %>StoreModule,
      providers: [
        { provide: <%= scuStoreName %>_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
