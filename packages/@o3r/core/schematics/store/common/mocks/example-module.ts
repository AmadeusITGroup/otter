export const commonModuleContent = `import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { ExampleEffect } from './example.effect';
import { exampleReducer } from './example.reducer';
import { EXAMPLE_STORE_NAME, ExampleState } from './example.state';

/** Token of the Example reducer */
export const EXAMPLE_REDUCER_TOKEN = new InjectionToken<ActionReducer<ExampleState, Action>>('Feature Example Reducer');

/** Provide default reducer for Example store */
export function getDefaultExampleReducer() {
  return exampleReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(EXAMPLE_STORE_NAME, EXAMPLE_REDUCER_TOKEN), EffectsModule.forFeature([ExampleEffect])
],
providers: [
  { provide: EXAMPLE_REDUCER_TOKEN, useFactory: getDefaultExampleReducer }
]
})
export class ExampleStoreModule {
public static forRoot<T extends ExampleState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<ExampleStoreModule> {
    return {
      ngModule: ExampleStoreModule,
      providers: [
        { provide: EXAMPLE_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}

`;
