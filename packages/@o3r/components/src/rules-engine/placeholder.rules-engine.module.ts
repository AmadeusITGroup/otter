import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { PlaceholderRequestStoreModule, PlaceholderTemplateStoreModule } from '@o3r/components';
import { PlaceholderRulesEngineActionHandler } from './placeholder.action-handler';
import { PlaceholderTemplateResponseEffect } from './placeholder.rules-engine.effect';

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
export class PlaceholderRulesEngineActionModule {
}
