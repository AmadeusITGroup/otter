import {
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  EffectsModule,
} from '@ngrx/effects';
import {
  Action,
  ActionReducer,
  StoreModule,
} from '@ngrx/store';
import {
  RulesetsEffect,
} from './rulesets.effect';
import {
  rulesetsReducer,
} from './rulesets.reducer';
import {
  RULESETS_STORE_NAME,
  RulesetsState,
} from './rulesets.state';

/** Token of the Rulesets reducer */
export const RULESETS_REDUCER_TOKEN = new InjectionToken<ActionReducer<RulesetsState, Action>>('Feature Rulesets Reducer');

/** Provide default reducer for Rulesets store */
export function getDefaultRulesetsReducer() {
  return rulesetsReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(RULESETS_STORE_NAME, RULESETS_REDUCER_TOKEN), EffectsModule.forFeature([RulesetsEffect])
  ],
  providers: [
    { provide: RULESETS_REDUCER_TOKEN, useFactory: getDefaultRulesetsReducer }
  ]
})
export class RulesetsStoreModule {
  public static forRoot<T extends RulesetsState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<RulesetsStoreModule> {
    return {
      ngModule: RulesetsStoreModule,
      providers: [
        { provide: RULESETS_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
