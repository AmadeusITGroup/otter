import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  NgModule,
} from '@angular/core';
import {
  EffectsModule,
  provideEffects,
} from '@ngrx/effects';
import {
  PlaceholderRulesEngineActionHandler,
} from './placeholder-action-handler';
import {
  PlaceholderTemplateResponseEffect,
} from './placeholder-rules-engine.effect';
import {
  PlaceholderRequestStoreModule,
  PlaceholderTemplateStoreModule,
  providePlaceholderRequestStore,
  providePlaceholderTemplateStore,
} from '@o3r/components';

/**
 * @deprecated Will be removed in v16. Use {@link providePlaceholderRulesEngineAction} instead.
 */
@NgModule({
  imports: [
    EffectsModule.forFeature([PlaceholderTemplateResponseEffect]),
    PlaceholderRequestStoreModule,
    PlaceholderTemplateStoreModule
  ],
  providers: [
    PlaceholderRulesEngineActionHandler
  ]
})
export class PlaceholderRulesEngineActionModule {}

/**
 * Provide placeholder rules engine action handler.
 */
export function providePlaceholderRulesEngineAction(): EnvironmentProviders {
  return makeEnvironmentProviders([
    providePlaceholderRequestStore(),
    providePlaceholderTemplateStore(),
    provideEffects(PlaceholderTemplateResponseEffect),
    PlaceholderRulesEngineActionHandler
  ]);
}
