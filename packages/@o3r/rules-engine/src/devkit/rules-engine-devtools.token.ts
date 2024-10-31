import {
  InjectionToken
} from '@angular/core';
import {
  RulesEngineDevtoolsServiceOptions
} from './rules-engine-devkit.interface';

export const OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS: RulesEngineDevtoolsServiceOptions = {
  isActivatedOnBootstrap: false
};

export const OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS: InjectionToken<RulesEngineDevtoolsServiceOptions> = new InjectionToken<RulesEngineDevtoolsServiceOptions>('Otter RulesEngine Devtools options');
