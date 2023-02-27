import type { Logger } from '@o3r/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { EngineDebugger } from './debug/engine.debug';
import { Fact } from './fact';
import { Operator } from './operator';
import { ActionBlock, Rule, Ruleset } from './structure';

/** Performance object supporting NodeJs Performance and Web Performance reporting  */
export type CrossPlatformPerformance = {
  /** @see Performance.mark */
  mark: (...x: Parameters<Performance['mark']>) => ReturnType<Performance['mark']> | void;
  /** @see Performance.measure */
  measure: (measureName: string, startOrMeasureOptions?: string, endMark?: string) => ReturnType<Performance['measure']> | void;
};

/** Fact stream object to handle fact reference change */
export interface FactObject<T> {
  /** Subject of fact stream */
  subject: BehaviorSubject<Observable<T> | undefined>;
  /** Stream of the fact value */
  value$: Observable<T | undefined>;
}

/** Represents all the supported facts types TOCHECK utils.Date vs Date */
export type Facts = string | number | boolean | null | Date | Record<string, unknown> | unknown[];


/** Rule Engine constructor options */
export interface RulesEngineOptions {
  /** List of facts */
  facts?: Fact<Facts>[];

  /** List of rules */
  rules?: Ruleset[];

  /** List of custom operators */
  operators?: Operator<any, any>[];

  /** Delay before fact stream defaulting value */
  factDefaultDelay?: number;

  /**
   * Skip the rule and fact circular dependency checks
   * Turn to true to increase the speed of the upsertion of a rule
   */
  skipCircularDependencyChecks?: boolean;

  /**
   * Provide debugger instance to the rules engine
   */
  debugger?: EngineDebugger;

  /**
   * Instance of the performance reporter to use for performance measurements.
   *
   * @default window.performance on browser only, undefined on node
   */
  performance?: CrossPlatformPerformance;

  /**
   * Name of the rules engine instance
   *
   * @default RulesEngine
   */
  rulesEngineInstanceName?: string;

  /**
   * Client to log the warning and error message
   */
  logger?: Logger;
}

/** Rule as stored in the rules engine */
export interface EngineRule extends Rule {
  /** stream of the rule conditions result */
  result$: BehaviorSubject<ActionBlock[]>;
}

/** Rule as stored in the rules engine */
export interface EngineRuleset {
  /** Optional date range where the ruleset will be executed, it supports a dateString or a timestamp as number, more info on javascript Date() documentation */
  validityRange?: { from?: string | number; to?: string | number };
  /** Component linked to the ruleset, if set it will disable the ruleset execution per default, waiting to a subscription */
  linkedComponent?: { library: string; name: string };
  /** Unique id of the ruleset*/
  id: string;
  /** Stores the result of each rules from the ruleset */
  rulesResultsSubject$: Observable<ActionBlock[]>;
}
/** Timestamp of a rules engine output event */
export interface TimedEvent {
  /** Timestamp value when the event occurs */
  timestamp: number;
  /** Duration of the execution */
  duration?: number;
}

/** Fact change triggering the evaluation of a rule/execution of a ruleset */
export interface EvaluationReason {
  /** Name of the fact that changed */
  factName: string;
  /** New value of the fact */
  newValue?: Facts;
  /** Old value of the fact */
  oldValue?: Facts;
}

/** Result object resulted at the end of a rule evaluation */
export interface RuleEvaluation extends TimedEvent {
  /** Identifier of the evaluation (ruleset name + rule name) */
  id: string;
  /** Evaluated rule identifier */
  rule: Pick<Rule, 'id' | 'name'>;
  /** Actions outputed by the rule evaluation */
  outputActions: ActionBlock[] | undefined;
  /** Map containing the facts changes triggering the rule evaluation */
  triggers: Record<string, Record<string, EvaluationReason>>;
  /** Error object in case of rule evaluation failure */
  error?: any;
  /** Runtime facts with values at the end of rule evaluation  */
  temporaryFacts?: Record<string, Facts>;
  /** Flag to notify if the rules evaluation comes from an old ruleset execution */
  cached?: boolean;
}

/** Wrapped rule evaluation output */
export interface RuleEvaluationOutput {
  /** Actions emitted at the end of rule evaluation */
  actions: ActionBlock[] | undefined;
  /** Rule evaluation output object */
  evaluation?: RuleEvaluation;
  /** Error object emitted at the end of rule evaluation, if any */
  error?: any;
}

/** Base obeject resulted at the end of a ruleset execution */
export interface BaseRulesetExecution {
  /** Id of the ruleset execution */
  executionId: string;
  /** Id of the ruleset which was executed */
  rulesetId: string;
  /** Name of the executed ruleset */
  rulesetName: string;
  /** Counter of executions for the ruleset */
  executionCounter: number;
  /** All input facts affecting the ruleset */
  inputFacts: {factName: string; value: Facts}[];
  /** Runtime facts used accros the ruleset */
  temporaryFacts?: Record<string, Facts>;
  /** Facts changes that triggered the execution of the ruleset */
  triggers: Record<string, Record<string, EvaluationReason>>;
  /** List of evaluated rules accros ruleset execution */
  rulesEvaluations: RuleEvaluation[];
}

/** Debug event emitted in case of successful ruleset execution */
export interface RulesetExecutionEvent extends BaseRulesetExecution, TimedEvent {
  /** Event type */
  type: 'RulesetExecution';
  /** List of the actions emitted at the end of ruleset execution */
  outputActions: ActionBlock[];
}

/** Debug event emitted in case of ruleset execution failure */
export interface RulesetExecutionErrorEvent extends BaseRulesetExecution, TimedEvent {
  /** Event type */
  type: 'RulesetExecutionError';
  /** List of rules causing the execution error*/
  rulesCausingTheError: Pick<Rule, 'name' | 'id'>[];
  /** List of outputted errors */
  errors: any[];
}

/** Debug event emitted when active rulesets are changing */
export interface ActiveRulesetsEvent extends TimedEvent {
  /** Event type */
  type: 'ActiveRulesets';
  /** List of active rulesets */
  rulesets: Pick<Ruleset, 'name' | 'id'>[];
}

/** Debug event emitted each time the Rules Engine outputs a list of actions */
export interface AllActionsEvent extends TimedEvent {
  /** event type */
  type: 'AllActions';
  /** List of emitted actions */
  actions: ActionBlock[];
}

/**  Debug event emitted when rulesets are registered to the rules engine */
export interface AvailableRulesets extends TimedEvent {
  /** Event type */
  type: 'AvailableRulesets';
  /** Registered rulesets list */
  availableRulesets: Pick<Ruleset, 'name' | 'id'>[];
}

/** Type of possible debug events emited by Rules Engine */
export type DebugEvent = RulesetExecutionEvent | RulesetExecutionErrorEvent | ActiveRulesetsEvent | AllActionsEvent | AvailableRulesets;
