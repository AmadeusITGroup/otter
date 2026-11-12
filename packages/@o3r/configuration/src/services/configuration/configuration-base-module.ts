import {
  NgModule,
} from '@angular/core';
import {
  ConfigurationStoreModule,
} from '../../stores/index';
import {
  ConfigurationBaseService,
} from './configuration-base-service';

/**
 * @deprecated Will be removed in v16. Use {@link import('@o3r/configuration').provideConfigurationStore} instead.
 */
@NgModule({
  imports: [ConfigurationStoreModule],
  providers: [ConfigurationBaseService]
})
export class ConfigurationBaseServiceModule {}
