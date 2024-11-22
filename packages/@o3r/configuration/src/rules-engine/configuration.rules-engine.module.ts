import {
  NgModule,
} from '@angular/core';
import {
  ConfigurationRulesEngineActionHandler,
} from './configuration.handler-action';
import {
  ConfigurationStoreModule,
} from '@o3r/configuration';

@NgModule({
  imports: [
    ConfigurationStoreModule
  ],
  providers: [
    ConfigurationRulesEngineActionHandler
  ]
})
export class ConfigurationRulesEngineActionModule {}
