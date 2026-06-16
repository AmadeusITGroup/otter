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
  provideRulesetsStore,
  RulesetsStoreModule,
} from '../stores/index';
import type {
  RulesEngineDevtoolsServiceOptions,
} from './rules-engine-devkit-interface';
import {
  OtterRulesEngineDevtools,
} from './rules-engine-devtools';
import {
  RulesEngineDevtoolsConsoleService,
} from './rules-engine-devtools-console-service';
import {
  RulesEngineDevtoolsMessageService,
} from './rules-engine-devtools-message-service';
import {
  OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS,
} from './rules-engine-devtools-token';

/**
 * @deprecated Will be removed in v16. Use {@link provideRulesEngineDevtools} instead.
 */
@NgModule({
  imports: [
    StoreModule,
    RulesetsStoreModule
  ],
  providers: [
    { provide: OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, useValue: OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS },
    RulesEngineDevtoolsMessageService,
    RulesEngineDevtoolsConsoleService
  ]
})
export class RulesEngineDevtoolsModule {
  /**
   * Initialize Otter Devtools
   * @param options
   */
  public static instrument(options: Partial<RulesEngineDevtoolsServiceOptions>): ModuleWithProviders<RulesEngineDevtoolsModule> {
    return {
      ngModule: RulesEngineDevtoolsModule,
      providers: [
        { provide: OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, useValue: { ...OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS, ...options }, multi: false },
        RulesEngineDevtoolsMessageService,
        RulesEngineDevtoolsConsoleService
      ]
    };
  }
}

/**
 * Provide rules engine devtools functionality.
 * @param options Rules engine devtools options
 */
export function provideRulesEngineDevtools(options?: Partial<RulesEngineDevtoolsServiceOptions>): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideRulesetsStore(),
    { provide: OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, useValue: { ...OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS, ...options } },
    RulesEngineDevtoolsMessageService,
    RulesEngineDevtoolsConsoleService,
    OtterRulesEngineDevtools
  ]);
}
