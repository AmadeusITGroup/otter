import {
  NgModule,
} from '@angular/core';
import {
  LocalizationRulesEngineActionHandler,
} from './localization-rules-engine-action-handler';
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
