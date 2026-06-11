import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  NgModule,
} from '@angular/core';
import {
  ConfigurationStoreModule,
  provideConfigurationStore,
} from '../../stores/index';

/** @deprecated Will be removed in v16. Use {@link provideConfigurationBaseService} instead. */
@NgModule({
  imports: [ConfigurationStoreModule]
})
export class ConfigurationBaseServiceModule {}

/**
 * Provide configuration base service for the application.
 */
export function provideConfigurationBaseService(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideConfigurationStore()
  ]);
}
