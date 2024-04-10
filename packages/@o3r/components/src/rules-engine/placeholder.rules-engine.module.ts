import { NgModule } from '@angular/core';
import { PlaceholderModule, PlaceholderRequestStoreModule, PlaceholderTemplateStoreModule } from '@o3r/components';
import { EffectsModule } from '@ngrx/effects';
import { PlaceholderRulesEngineActionHandler } from './placeholder.action-handler';
import { PlaceholderTemplateResponseEffect } from '@o3r/components';

@NgModule({
  imports: [
    EffectsModule.forFeature([PlaceholderTemplateResponseEffect]),
    PlaceholderRequestStoreModule,
    PlaceholderTemplateStoreModule,
    PlaceholderModule
  ],
  providers: [
    PlaceholderRulesEngineActionHandler
  ]
})
export class PlaceholderRulesEngineActionModule {
}
