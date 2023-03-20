import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { LoggerModule } from '@o3r/logger';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicContentModule } from '@o3r/dynamic-content';
import { RulesetsStoreModule } from '../stores/index';
import { PlaceholderTemplateResponseEffect } from './rules-engine.effect';
import { RulesEngineService } from './rules-engine.service';
import { DEFAULT_RULES_ENGINE_OPTIONS, RULES_ENGINE_OPTIONS, RulesEngineServiceOptions } from './rules-engine.token';

@NgModule({
  imports: [
    StoreModule,
    DynamicContentModule,
    RulesetsStoreModule,
    LoggerModule,
    TranslateModule,
    EffectsModule.forFeature([PlaceholderTemplateResponseEffect])
  ]
})
export class RulesEngineModule {
  public static forRoot(options?: Partial<RulesEngineServiceOptions>): ModuleWithProviders<RulesEngineModule> {
    const opts = options ? { ...DEFAULT_RULES_ENGINE_OPTIONS, ...options} : DEFAULT_RULES_ENGINE_OPTIONS;
    return {
      ngModule: RulesEngineModule,
      providers: [
        { provide: RULES_ENGINE_OPTIONS, useValue: opts },
        RulesEngineService
      ]
    };
  }
}
