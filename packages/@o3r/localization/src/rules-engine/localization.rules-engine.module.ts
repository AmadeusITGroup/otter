import {
  NgModule,
} from '@angular/core';
import {
  LocalizationOverrideStoreModule,
} from '../stores/index';
import {
  LocalizationRulesEngineActionHandler,
} from './localization.handler-action';

@NgModule({
  imports: [
    LocalizationOverrideStoreModule
  ],
  providers: [
    LocalizationRulesEngineActionHandler
  ]
})
export class LocalizationRulesEngineActionModule {}
