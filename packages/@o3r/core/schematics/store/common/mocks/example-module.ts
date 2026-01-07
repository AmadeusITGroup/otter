export const commonModuleContent = `import { InjectionToken, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { ExampleEffect } from './example.effect';
import { exampleReducer } from './example.reducer';
import { EXAMPLE_STORE_NAME, ExampleState } from './example.state';


/** Action Reducer map for Example store */
type ExampleActionReducer<T extends ExampleState=ExampleState, V extends Action=Action> = ActionReducer<T, V>;

/** Internal Token of the Example reducer */
const INTERNAL_EXAMPLE_REDUCER_TOKEN = new InjectionToken<ExampleActionReducer>('Internal Example Reducer');

/** Token of the Example reducer */
export const EXAMPLE_REDUCER_TOKEN = new InjectionToken<ExampleActionReducer>('Feature Example Reducer');

/**
 * Retrieve default reducer for Example store
 * @param customReducer
 */
export function getExampleReducer(customReducer: ExampleActionReducer = exampleReducer): ExampleActionReducer {
  return customReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(EXAMPLE_STORE_NAME, INTERNAL_EXAMPLE_REDUCER_TOKEN), EffectsModule.forFeature([ExampleEffect])
  ],
  providers: [{
    provide: INTERNAL_EXAMPLE_REDUCER_TOKEN,
    useFactory: getExampleReducer,
    deps: [[new Optional(), EXAMPLE_REDUCER_TOKEN]]
  }]
})
export class ExampleStoreModule {
public static forRoot<T extends ExampleState>(reducerFactory: () => ExampleActionReducer<T>): ModuleWithProviders<ExampleStoreModule> {
    return {
      ngModule: ExampleStoreModule,
      providers: [
        { provide: EXAMPLE_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}

`;
