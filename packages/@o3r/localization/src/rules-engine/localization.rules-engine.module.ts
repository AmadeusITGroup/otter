import {
  NgModule,
} from '@angular/core';
import {
  LocalizationRulesEngineActionHandler,
} from './localization.handler-action';
import {
  LocalizationOverrideStoreModule,
} from '@o3r/localization';

@NgModule({
  imports: [
    LocalizationOverrideStoreModule
  ],
  providers: [
    LocalizationRulesEngineActionHandler
  ]
})
export class LocalizationRulesEngineActionModule {}
