/** Ruleset executor */
import { JSONPath } from 'jsonpath-plus';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, pairwise, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { handleRuleEvaluationDebug } from './debug/helpers';
import type { RulesEngine } from './engine';
import type { Facts } from './fact';
import { EngineRuleset, EvaluationReason, RuleEvaluation, RuleEvaluationOutput } from './engine.interface';
import { executeOperator } from './operator/operator.helpers';
import { Operator } from './operator/operator.interface';
import {
  isAllConditions,
  isConditionProperties,
  isNotCondition,
  isOperandFact,
  isOperandLiteral,
  isOperandRuntimeFact
} from './rule/rule.helpers';
import {
  ActionBlock,
  ActionSetTemporaryFactBlock,
  AllBlock,
  GenericOperand,
  IfElseBlock,
  NestedCondition,
  Rule,
  Ruleset
} from './structure';

/** Type of the retrieve fact function */
export type RetrieveFactFuncType = <T = unknown> (id: string) => Observable<T | undefined>;

export class RulesetExecutor {

  /** retrieveFactFunc */
  protected readonly rulesEngine: RulesEngine;

  /** Map of available operators */
  protected readonly operators: Record<string, Operator<unknown, unknown>>;

  /** Delay before fact stream defaulting value */
  public readonly factDefaultDelay?: number;

  /** Ruleset associated to the current executor*/
  public readonly ruleset: Ruleset;

  /** Ruleset plugged to the fact stream, that contains actions stream result */
  public readonly engineRuleset: EngineRuleset;

  private executionCounter = 0;

  /**
   * Create a new ruleset executor
   * @param ruleset Ruleset to evaluate
   * @param rulesEngine Instance of the rules engine
   */
  constructor(ruleset: Ruleset, rulesEngine: RulesEngine) {
    this.ruleset = ruleset;
    this.rulesEngine = rulesEngine;
    this.operators = rulesEngine.operators;
    this.engineRuleset = this.plugRuleset();
  }

  /**
   * Recursively explores a rule to identify and collect input facts.
   * Input facts are identified based on the 'FACT' type and operator-specific implicit dependencies.
   * @param currentObject The current object being explored.
   * @param ruleInputFacts A set to store the identified input facts for the rule.
   */
  private collectRuleInputFacts(currentObject: AllBlock | NestedCondition | NestedCondition[], ruleInputFacts: Set<string>) {
    if (currentObject && isOperandFact(currentObject)) {
      ruleInputFacts.add(currentObject.value);
    } else if (Array.isArray(currentObject)) {
      currentObject.forEach((elem) => this.collectRuleInputFacts(elem, ruleInputFacts));
    } else {
      for (const key in currentObject) {
        if ((key === 'operator') && isConditionProperties(currentObject)) {
          const op = this.operators[currentObject[key]];
          if (op && op.factImplicitDependencies) {
            op.factImplicitDependencies.forEach(dep => ruleInputFacts.add(dep));
          }
        } else if (typeof currentObject[key as keyof (AllBlock | NestedCondition)] === 'object') {
          this.collectRuleInputFacts(currentObject[key as keyof (AllBlock | NestedCondition)], ruleInputFacts);
        }
      }
    }
  }

  /**
   * Report performance mark for a rule run
   * @param rule Rule to measure
   * @param status status of the rule evaluation
   */
  protected performanceMark(rule: Rule, status: 'start' | 'end') {
    if (this.rulesEngine.performance) {
      const markName = `rules-engine:${this.rulesEngine.rulesEngineInstanceName}:${this.ruleset.name}:${rule.name}`;
      this.rulesEngine.performance.mark(`${markName}:${status}`);
      if (status === 'end') {
        this.rulesEngine.performance.measure(markName, `${markName}:start`, `${markName}:end`);
      }
    }
  }

  /**
   * Get operand value stream according to its type
   * @param operand operand of the condition
   * @param factsValue
   * @param runtimeFactValues
   */
  protected getOperandValue(operand: GenericOperand | undefined, factsValue: Record<string, Facts | undefined>, runtimeFactValues: Record<string, Facts>): unknown | unknown[] {
    if (typeof operand === 'undefined') {
      return undefined;
    } else if (isOperandFact(operand)) {
      const factValue = factsValue[operand.value];
      // eslint-disable-next-line new-cap
      return operand.path ? factValue && JSONPath({wrap: false, json: factValue, path: operand.path}) : factValue;
    } else if (isOperandLiteral(operand)) {
      return operand.value;
    } else if (isOperandRuntimeFact(operand)) {
      return runtimeFactValues[operand.value];
    }
    return undefined;
  }

  /**
   * Process a root rule from a ruleset, and return the associated actions to be processed
   * Will also update the runtimeFactValues map that is ruleset wise
   * Note that runtimeFactValues will be mutated by all the runtime facts actions executed
   * @param rule
   * @param factsValue
   * @param runtimeFactValues
   * @protected
   */
  protected evaluateRule(rule: Rule, factsValue: Record<string, Facts | undefined>, runtimeFactValues: Record<string, Facts>) {
    return this.evaluateBlock(rule.rootElement, factsValue, runtimeFactValues);
  }

  /**
   * Recursively process a block to extract all the actions keeping the order
   * Note that runtimeFactValues will be mutated by all the runtime facts actions executed
   * @param element
   * @param actions
   * @param factsValue
   * @param runtimeFactValues This runtime fact map will be mutated by all the runtime facts actions executed
   * @protected
   */
  protected evaluateBlock(element: AllBlock, factsValue: Record<string, Facts | undefined>, runtimeFactValues: Record<string, Facts>, actions: ActionBlock[] = []) {
    if (this.isIfElseBlock(element)) {
      (!element.condition || this.evaluateCondition(element.condition, factsValue, runtimeFactValues) ? element.successElements : element.failureElements)
        .forEach((elementResult) => this.evaluateBlock(elementResult, factsValue, runtimeFactValues, actions));
    } else if (this.isActionBlock(element)) {
      if (this.isActionSetTemporaryFactBlock(element)) {
        runtimeFactValues[element.fact] = element.value;
      } else {
        actions.push(element);
      }
    }
    return actions;
  }

  /**
   * Returns true if the element is a IfElse block
   * @param element
   * @protected
   */
  protected isIfElseBlock(element: AllBlock): element is IfElseBlock {
    return element.blockType === 'IF_ELSE';
  }

  /**
   * Returns true if the element is an action block
   * @param element
   * @protected
   */
  protected isActionBlock(element: AllBlock): element is ActionBlock {
    return 'elementType' in element && element.elementType === 'ACTION';
  }

  /**
   * Returns true if the action sets a temporary fact
   * @param element
   * @protected
   */
  protected isActionSetTemporaryFactBlock(element: ActionBlock): element is ActionSetTemporaryFactBlock {
    return 'actionType' in element && element.actionType === 'SET_FACT';
  }

  /**
   * Evaluate a condition block
   * @param nestedCondition
   * @param factsValue
   * @param runtimeFactValues
   * @protected
   */
  protected evaluateCondition(nestedCondition: NestedCondition, factsValue: Record<string, Facts | undefined>, runtimeFactValues: Record<string, Facts>): boolean {
    if (isConditionProperties(nestedCondition)) {
      const operator = this.operators[nestedCondition.operator];
      if (operator === undefined) {
        throw new Error(`Unknown operator : ${nestedCondition.operator}, skipping the rule execution...`);
      }
      return executeOperator(this.getOperandValue(nestedCondition.lhs, factsValue, runtimeFactValues),
        this.getOperandValue('rhs' in nestedCondition ? nestedCondition.rhs : undefined, factsValue, runtimeFactValues), operator, factsValue);
    }

    if (isNotCondition(nestedCondition)) {
      return !this.evaluateCondition(nestedCondition.not, factsValue, runtimeFactValues);
    }
    if (nestedCondition.all || nestedCondition.any) {
      const evaluate = (condition: NestedCondition) => this.evaluateCondition(condition, factsValue, runtimeFactValues);
      return isAllConditions(nestedCondition) ? nestedCondition.all.every(evaluate) : nestedCondition.any.some(evaluate);
    }
    throw new Error(`Unknown condition block met : ${JSON.stringify(nestedCondition)}`);
  }

  /**
   * Plug ruleset to fact streams and trigger a first evaluation
   */
  protected plugRuleset() {
    const inputFactsForRule: Record<string, string[]> = {};
    const findRuleInputFacts = (obj: AllBlock): string[] => {
      const ruleInputFacts = new Set<string>();
      this.collectRuleInputFacts(obj, ruleInputFacts);
      return Array.from(ruleInputFacts);
    };
    this.ruleset.rules.forEach((rule) => inputFactsForRule[rule.id] = findRuleInputFacts(rule.rootElement));
    const factsThatRerunEverything: string[] = [];
    this.ruleset.rules.forEach((rule) => {
      if (rule.outputRuntimeFacts.length > 0 || rule.inputRuntimeFacts.length > 0) {
        factsThatRerunEverything.push(...inputFactsForRule[rule.id]);
      } else {
      }
    });
    const triggerFull$: Observable<unknown[]> = factsThatRerunEverything.length === 0 ? of([]) :
      combineLatest(factsThatRerunEverything.map((fact) => this.rulesEngine.retrieveOrCreateFactStream(fact)));
    const result$ = triggerFull$.pipe(switchMap(() => {
      const runtimeFactValues: Record<string, Facts> = {};

      let rulesetInputFacts: string[];
      if (this.rulesEngine.debugMode) {
        rulesetInputFacts = Array.from(this.ruleset.rules.reduce((acc, rule) => {
          inputFactsForRule[rule.id].forEach((factName) => acc.add(factName));
          return acc;
        }, new Set<string>()));
      }

      return combineLatest(this.ruleset.rules.map((rule) => {
        const inputFacts = inputFactsForRule[rule.id];
        const values$ = inputFacts.map((fact) => this.rulesEngine.retrieveOrCreateFactStream(fact));
        return (values$.length ? combineLatest(values$) : of([[]] as (Facts | undefined)[]))
          .pipe(
            startWith(undefined),
            pairwise(),
            tap(() => this.performanceMark(rule, 'start')),
            map(([oldFactValues, factValues]) => {
              const output: RuleEvaluationOutput = {actions: undefined};

              try {
                output.actions = this.evaluateRule(rule, inputFacts.reduce<Record<string, Facts | undefined>>((acc, id, index) => {
                  acc[id] = factValues![index];
                  return acc;
                }, {}), runtimeFactValues);
              } catch (error) {
                output.actions = undefined;
                output.error = error;
              }

              if (this.rulesEngine.debugMode) {
                output.evaluation = handleRuleEvaluationDebug({ ...rule, inputFacts }, this.ruleset.name, output.actions, output.error, runtimeFactValues, factValues, oldFactValues);
              } else if (output.error) {
                let errorMsg;
                if (output.error instanceof Error) {
                  errorMsg = output.error.toString();
                } else if (typeof output.error === 'string') {
                  errorMsg = output.error;
                } else {
                  errorMsg = JSON.stringify(output.error);
                }
                this.rulesEngine.logger?.error(errorMsg);
                this.rulesEngine.logger?.warn(`Skipping rule ${rule.name}, and the associated ruleset`);
              }
              return output;
            }),
            tap(() => this.performanceMark(rule, 'end'))
          );
      })).pipe(
        startWith(undefined),
        pairwise(),
        map(([prevRes, currRes]) => {
          const actionsLists = currRes!.map(r => r.actions);
          const allExecutionsValid = actionsLists.every((actions) => !!actions);

          let execInfo: {
            executionCounter?: number;
            actionsLists: ActionBlock[][];
            rulesetOutputExecution?: RuleEvaluation[];
            allExecutionsValid?: boolean;
            rulesetTriggers?: Record<string, Record<string, EvaluationReason>>;
          } = {actionsLists: (allExecutionsValid ? actionsLists : [[]]) as ActionBlock[][]};

          if (this.rulesEngine.engineDebug) {
            execInfo = {
              ...execInfo,
              ...this.rulesEngine.engineDebug.handleDebugRulesetExecutionInfo(
                currRes!, prevRes, allExecutionsValid, rulesetInputFacts, runtimeFactValues, ++this.executionCounter, this.ruleset)
            };
          }
          return execInfo;
        }),
        map((output) => {
          const outputActions = ([] as ActionBlock[]).concat(...output.actionsLists);

          if (this.rulesEngine.engineDebug && output.allExecutionsValid) {
            this.rulesEngine.engineDebug.addRulesetExecutionEvent(this.ruleset, output.executionCounter!,
              rulesetInputFacts, outputActions, runtimeFactValues, output.rulesetTriggers!,
              output.rulesetOutputExecution!);
          }

          return outputActions;
        }),
        distinctUntilChanged((prev, curr) => prev.length === 0 && curr.length === 0)
      );
    }), shareReplay({bufferSize: 1, refCount: true}));

    return {
      id: this.ruleset.id,
      validityRange: this.ruleset.validityRange,
      linkedComponent: this.ruleset.linkedComponent,
      rulesResultsSubject$: result$
    } as EngineRuleset;
  }

  /**
   * Plug ruleset to fact streams and trigger a first evaluation
   * @deprecated This function is not made to be accessible from Outside of the class, will be removed in v10
   */
  public prepareRuleset() {
    return this.plugRuleset();
  }
}
