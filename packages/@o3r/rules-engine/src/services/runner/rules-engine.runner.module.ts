import {
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  StoreModule,
} from '@ngrx/store';
import {
  LoggerModule,
} from '@o3r/logger';
import {
  RulesetsStoreModule,
} from '../../stores/index';
import {
  DEFAULT_RULES_ENGINE_OPTIONS,
  RULES_ENGINE_OPTIONS,
  RulesEngineServiceOptions,
} from '../rules-engine.token';
import {
  RulesEngineRunnerService,
} from './rules-engine.runner.service';

@NgModule({
  imports: [
    StoreModule,
    RulesetsStoreModule,
    LoggerModule
  ]
})
export class RulesEngineRunnerModule {
  public static forRoot(options?: Partial<RulesEngineServiceOptions>): ModuleWithProviders<RulesEngineRunnerModule> {
    const opts = options ? { ...DEFAULT_RULES_ENGINE_OPTIONS, ...options } : DEFAULT_RULES_ENGINE_OPTIONS;
    return {
      ngModule: RulesEngineRunnerModule,
      providers: [
        { provide: RULES_ENGINE_OPTIONS, useValue: opts },
        RulesEngineRunnerService
      ]
    };
  }
}
