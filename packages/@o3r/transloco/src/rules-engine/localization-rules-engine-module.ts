import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  NgModule,
} from '@angular/core';
import {
  LocalizationRulesEngineActionHandler,
} from './localization-rules-engine-action-handler';
import {
  LocalizationOverrideStoreModule,
  provideLocalizationOverrideStore,
} from '@o3r/transloco';

/**
 * @deprecated Will be removed in v16. Use {@link provideLocalizationRulesEngineAction} instead.
 */
@NgModule({
  imports: [
    LocalizationOverrideStoreModule
  ],
  providers: [
    LocalizationRulesEngineActionHandler
  ]
})
export class LocalizationRulesEngineActionModule {}

/** Provide localization rules engine action handler. */
export function provideLocalizationRulesEngineAction(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideLocalizationOverrideStore(),
    LocalizationRulesEngineActionHandler
  ]);
}
