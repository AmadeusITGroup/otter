import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  NgModule,
} from '@angular/core';
import {
  ConfigurationRulesEngineActionHandler,
} from './configuration-handler-action';
import {
  ConfigurationStoreModule,
} from '@o3r/configuration';

/** @deprecated Will be removed in v16. Use {@link provideConfigurationRulesEngineAction} instead. */
@NgModule({
  imports: [
    ConfigurationStoreModule
  ],
  providers: [
    ConfigurationRulesEngineActionHandler
  ]
})
export class ConfigurationRulesEngineActionModule {}

/**
 * Provide configuration rules engine action handler for the application.
 */
export function provideConfigurationRulesEngineAction(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ConfigurationRulesEngineActionHandler
  ]);
}
