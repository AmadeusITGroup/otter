import {
  InjectionToken,
} from '@angular/core';
import {
  RulesEngineDevtoolsServiceOptions,
} from './rules-engine-devkit-interface';

export const OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS: Readonly<RulesEngineDevtoolsServiceOptions> = {
  isActivatedOnBootstrap: false
} as const;

export const OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS = new InjectionToken<RulesEngineDevtoolsServiceOptions>('Otter RulesEngine Devtools options');
