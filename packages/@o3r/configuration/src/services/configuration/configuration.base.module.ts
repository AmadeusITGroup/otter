import {
  NgModule,
} from '@angular/core';
import {
  LoggerModule,
} from '@o3r/logger';
import {
  ConfigurationStoreModule,
} from '../../stores/index';

@NgModule({
  imports: [ConfigurationStoreModule, LoggerModule]
})
export class ConfigurationBaseServiceModule {}
