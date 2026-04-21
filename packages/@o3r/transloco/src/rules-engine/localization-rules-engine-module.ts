import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  type Provider,
} from '@angular/core';
import {
  LocalizationRulesEngineActionHandler,
} from './localization-rules-engine-action-handler';
import {
  provideLocalizationOverrideStore,
} from '@o3r/transloco';

/**
 * Provide the localization rules engine action handler for the application.
 * This is the recommended way to set up the localization rules engine in standalone applications.
 * @example Provide the Rules Engine action in application bootstrap
 * ```typescript
 * bootstrapApplication(App, {
 *   providers: [
 *     provideStore(),
 *     provideLocalizationOverrideStore(),
 *     provideLocalizationRulesEngineAction()
 *   ]
 * });
 * ```
 */
export function provideLocalizationRulesEngineAction(): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [
    provideLocalizationOverrideStore(),
    LocalizationRulesEngineActionHandler
  ];

  return makeEnvironmentProviders(providers);
}
