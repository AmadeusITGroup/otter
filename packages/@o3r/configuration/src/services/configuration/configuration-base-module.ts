import {
  NgModule,
} from '@angular/core';
import {
  ConfigurationStoreModule,
} from '../../stores/index';

/**
 * @deprecated Will be removed in v16. Use {@link import('@o3r/configuration').provideConfigurationStore} instead.
 */
@NgModule({
  imports: [ConfigurationStoreModule]
})
export class ConfigurationBaseServiceModule {}
