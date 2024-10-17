import { NgModule } from '@angular/core';
import { ConfigurationStoreModule } from '@o3r/configuration';
import { ConfigurationRulesEngineActionHandler } from './configuration.handler-action';

@NgModule({
  imports: [
    ConfigurationStoreModule
  ],
  providers: [
    ConfigurationRulesEngineActionHandler
  ]
})
export class ConfigurationRulesEngineActionModule {}
