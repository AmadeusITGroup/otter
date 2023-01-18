import { ModuleWithProviders, NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { RulesetsStoreModule } from '../stores/index';
import type { RulesEngineDevtoolsServiceOptions } from './rules-engine-devkit.interface';
import { RulesEngineDevtoolsConsoleService } from './rules-engine-devtools.console.service';
import { RulesEngineDevtoolsMessageService } from './rules-engine-devtools.message.service';
import { OtterRulesEngineDevtools } from './rules-engine-devtools.service';
import { OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS, OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS } from './rules-engine-devtools.token';

@NgModule({
  imports: [
    StoreModule,
    RulesetsStoreModule
  ],
  providers: [
    { provide: OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, useValue: OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS },
    RulesEngineDevtoolsMessageService,
    RulesEngineDevtoolsConsoleService,
    OtterRulesEngineDevtools
  ]
})
export class RulesEngineDevtoolsModule {

  /**
   * Initialize Otter Devtools
   *
   * @param options
   */
  public static instrument(options: Partial<RulesEngineDevtoolsServiceOptions>): ModuleWithProviders<RulesEngineDevtoolsModule> {
    return {
      ngModule: RulesEngineDevtoolsModule,
      providers: [
        { provide: OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, useValue: {...OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS, ...options}, multi: false },
        RulesEngineDevtoolsMessageService,
        RulesEngineDevtoolsConsoleService,
        OtterRulesEngineDevtools
      ]
    };
  }
}
