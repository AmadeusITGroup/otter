import { EvaluationReason, RuleEvaluation, RuleEvaluationOutput } from '../engine.interface';
import type { Facts } from '../fact';
import { ActionBlock, Rule } from '../structure';

/**
 * Function to retrive from 2 sequential executions only the triggers which activated the last ruleset execution
 * @param currRes Current ruleset execution object
 * @param prevRes Previous ruleset execution object
 * @returns The triggers list which activates the last ruleset execution
 */
export function retrieveRulesetTriggers(currRes: RuleEvaluationOutput[], prevRes: RuleEvaluationOutput[] | undefined) {

  let rulesetTriggers: Record<string, Record<string, EvaluationReason>> = {};

  const allCurrRulesetTriggersList = currRes.map(r => r.evaluation).filter((e): e is RuleEvaluation => !!e).map(e => e.triggers);
  const allCurrRulesetTriggers: Record<string, Record<string, EvaluationReason>> = {};

  allCurrRulesetTriggersList.forEach((rTrig) => {
    Object.keys(rTrig).forEach((ruleId) => {
      allCurrRulesetTriggers[ruleId] = rTrig[ruleId];
    });
  });

  if (!prevRes) {
    rulesetTriggers = allCurrRulesetTriggers;
  } else {

    const allPrevRulesetTriggersList = prevRes.map(r => r.evaluation).filter((e): e is RuleEvaluation => !!e).map(e => e.triggers);
    const allPrevRulesetTriggers: Record<string, Record<string, EvaluationReason>> = {};

    allPrevRulesetTriggersList.forEach((rTrig) => {
      Object.keys(rTrig).forEach((ruleId) => {
        allPrevRulesetTriggers[ruleId] = rTrig[ruleId];
      });
    });

    Object.entries(allCurrRulesetTriggers).forEach(([ruleId, ruleTriggers]) => {
      Object.keys(ruleTriggers).forEach((factName) => {
        if (!allPrevRulesetTriggers[ruleId] ||
          !allPrevRulesetTriggers[ruleId][factName] ||
          ruleTriggers[factName].newValue !== allPrevRulesetTriggers[ruleId][factName].newValue) {
          (rulesetTriggers[ruleId] ||= {})[factName] = ruleTriggers[factName];
        }
      });
    });

  }
  return rulesetTriggers;
}

/**
 * Flag as cached the rules evaluations which are from previous ruleset executions
 * @param rulesEvaluations all rules evaluations list
 * @param triggers Ruleset triggers object
 * @returns Rules evaluation list with flagged rules evaluation from previous ruleset executions
 */
export function flagCachedRules(rulesEvaluations: RuleEvaluation[], triggers: Record<string, Record<string, EvaluationReason>>): (RuleEvaluation & {cached?: boolean})[] {
  const rulesWhichTriggeredExecution = Object.keys(triggers);

  return rulesEvaluations.map((e) => {
    if (e && rulesWhichTriggeredExecution.indexOf(e.rule.id) === -1) {
      return {...e, cached: true};
    }
    return {...e};
  });
}

/**
 * Create the debug rule evaluation object
 * @param rule
 * @param rulesetName
 * @param outputActions
 * @param outputError
 * @param runtimeFactValues
 * @param factValues
 * @param oldFactValues
 */
export function handleRuleEvaluationDebug(
  rule: Rule,
  rulesetName: string,
  outputActions: ActionBlock[] | undefined,
  outputError: any,
  runtimeFactValues: Record<string, Facts>,
  factValues: any[] | undefined,
  oldFactValues: any[] | undefined) {

  const executionId = `${rulesetName} - ${rule.name}`;

  const reasons: Record<string, Record<string, EvaluationReason>> = {};
  for (let index = 0; index < factValues!.length; index++) {
    if (!oldFactValues) {
      (reasons[rule.id] ||= {})[rule.inputFacts[index]] = { factName: rule.inputFacts[index], newValue: factValues![index] };
    }
    else if (oldFactValues[index]?.toString() !== factValues![index]?.toString()) {
      (reasons[rule.id] ||= {})[rule.inputFacts[index]] = { factName: rule.inputFacts[index], oldValue: oldFactValues[index], newValue: factValues![index] };
    }
  }

  const ruleEvaluation: RuleEvaluation = {
    timestamp: Date.now(),
    outputActions,
    id: executionId,
    triggers: reasons,
    temporaryFacts: rule.outputRuntimeFacts.concat(rule.inputRuntimeFacts).reduce<Record<string, Facts>>((acc, runtimeFactName) => {
      if (typeof runtimeFactValues[runtimeFactName] !== 'undefined') {
        acc[runtimeFactName] = runtimeFactValues[runtimeFactName];
      }
      return acc;
    }, {}
    ),
    rule: { id: rule.id, name: rule.name },
    ...(outputError ? { error: outputError } : {})
  };
  return ruleEvaluation;
}
