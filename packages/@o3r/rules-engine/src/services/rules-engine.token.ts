import {
  InjectionToken,
} from '@angular/core';

/** Determine if the action should be executed */
export const RULES_ENGINE_OPTIONS = new InjectionToken<boolean>('Rules Engine Options');

/** Rules engine configuration */
export interface RulesEngineServiceOptions {
  /** Determine if the actions resulting of the rule engine should be executed */
  dryRun: boolean;
  /** Flag to activate the run of Rules Engine in debug mode */
  debug: boolean;
  /** Limit the number of debug events kept in stack */
  debugEventsStackLimit?: number;
}

/** Default Rules engine options */
export const DEFAULT_RULES_ENGINE_OPTIONS: Readonly<RulesEngineServiceOptions> = {
  dryRun: false,
  debug: false
} as const;
