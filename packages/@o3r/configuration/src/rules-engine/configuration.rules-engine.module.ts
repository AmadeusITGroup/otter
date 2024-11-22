import {
  NgModule,
} from '@angular/core';
import {
  ConfigurationStoreModule,
} from '../stores/index';
import {
  ConfigurationRulesEngineActionHandler,
} from './configuration.handler-action';

@NgModule({
  imports: [
    ConfigurationStoreModule
  ],
  providers: [
    ConfigurationRulesEngineActionHandler
  ]
})
export class ConfigurationRulesEngineActionModule {}
