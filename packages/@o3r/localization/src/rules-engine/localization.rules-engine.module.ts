import {
  NgModule,
} from '@angular/core';
import {
  LocalizationOverrideStoreModule,
} from '@o3r/localization';
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
