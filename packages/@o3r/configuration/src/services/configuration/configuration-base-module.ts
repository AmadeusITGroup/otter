import {
  EnvironmentProviders,
  NgModule,
} from '@angular/core';
import {
  ConfigurationStoreModule,
  provideConfigurationStore,
} from '../../stores/index';

/**
 * @deprecated Will be removed in v16. Use {@link provideConfigurationBaseService} instead.
 */
@NgModule({
  imports: [ConfigurationStoreModule]
})
export class ConfigurationBaseServiceModule {}

/**
 * Provide configuration base service.
 */
export function provideConfigurationBaseService(): EnvironmentProviders {
  return provideConfigurationStore();
}
