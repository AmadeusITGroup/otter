import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  StoreModule,
} from '@ngrx/store';
import {
  provideLogger,
} from '@o3r/logger';
import {
  RulesetsStoreModule,
} from '../../stores/index';
import {
  DEFAULT_RULES_ENGINE_OPTIONS,
  RULES_ENGINE_OPTIONS,
  RulesEngineServiceOptions,
} from '../rules-engine-token';
import {
  RulesEngineRunnerService,
} from './rules-engine-runner-service';

/** @deprecated Will be removed in v16. Use {@link provideRulesEngineRunner} instead. */
@NgModule({
  imports: [
    StoreModule,
    RulesetsStoreModule
  ]
})
export class RulesEngineRunnerModule {
  public static forRoot(options?: Partial<RulesEngineServiceOptions>): ModuleWithProviders<RulesEngineRunnerModule> {
    const opts = options ? { ...DEFAULT_RULES_ENGINE_OPTIONS, ...options } : DEFAULT_RULES_ENGINE_OPTIONS;
    return {
      ngModule: RulesEngineRunnerModule,
      providers: [
        provideLogger(),
        { provide: RULES_ENGINE_OPTIONS, useValue: opts },
        RulesEngineRunnerService
      ]
    };
  }
}

/**
 * Provide rules engine runner for the application.
 * @param options Optional partial rules engine configuration to override defaults.
 */
export function provideRulesEngineRunner(options?: Partial<RulesEngineServiceOptions>): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideLogger(),
    { provide: RULES_ENGINE_OPTIONS, useValue: options ? { ...DEFAULT_RULES_ENGINE_OPTIONS, ...options } : DEFAULT_RULES_ENGINE_OPTIONS },
    RulesEngineRunnerService
  ]);
}
