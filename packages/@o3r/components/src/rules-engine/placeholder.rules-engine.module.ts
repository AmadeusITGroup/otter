import {
  NgModule,
} from '@angular/core';
import {
  EffectsModule,
} from '@ngrx/effects';
import {
  PlaceholderRulesEngineActionHandler,
} from './placeholder.action-handler';
import {
  PlaceholderTemplateResponseEffect,
} from './placeholder.rules-engine.effect';
import {
  PlaceholderRequestStoreModule,
  PlaceholderTemplateStoreModule,
} from '@o3r/components';

@NgModule({
  imports: [
    EffectsModule.forFeature([PlaceholderTemplateResponseEffect]),
    PlaceholderRequestStoreModule,
    PlaceholderTemplateStoreModule
  ],
  providers: [
    PlaceholderRulesEngineActionHandler
  ]
})
export class PlaceholderRulesEngineActionModule {}
