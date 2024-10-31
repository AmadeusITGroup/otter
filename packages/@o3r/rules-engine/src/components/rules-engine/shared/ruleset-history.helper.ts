import type {
  DebugEvent,
  Ruleset,
  RulesetExecutionErrorEvent,
  RulesetExecutionEvent
} from '../../../engine';
import type {
  RulesetExecutionDebug,
  RulesetExecutionStatus
} from '../ruleset-history/ruleset-history-pres.component';

/**
 * Compute the status of the execution depending on its execution event type, the output and whether the execution
 * is still active
 * @param rulesetExecution
 * @param isActive
 */
export const getStatus = (rulesetExecution: RulesetExecutionErrorEvent | RulesetExecutionEvent, isActive: boolean): RulesetExecutionStatus => {
  if (rulesetExecution.type === 'RulesetExecutionError') {
    return 'Error';
  } else if (rulesetExecution.outputActions?.length === 0) {
    return 'NoEffect';
  } else if (isActive) {
    return 'Active';
  }
  return 'Deactivated';
};

/**
 * Transform the output of the debug reports into the model for the ruleset history debug panel
 * @param events
 * @param rulesetMap
 */
export const rulesetReportToHistory = (events: DebugEvent[], rulesetMap: Record<string, Ruleset>): RulesetExecutionDebug[] => {
  const availableRulesets = (events.filter((e) => e.type === 'AvailableRulesets').reverse()[0])?.availableRulesets || [];
  const lastActiveRulesets = (events.filter((e) => e.type === 'ActiveRulesets').reverse()[0])?.rulesets || [];

  return availableRulesets
    .filter((ruleset) => !!ruleset)
    .reduce<(RulesetExecutionEvent | RulesetExecutionErrorEvent)[]>((acc, ruleset) => {
    const rulesetExecutions = events
      .filter((e): e is RulesetExecutionEvent | RulesetExecutionErrorEvent => ((e.type === 'RulesetExecutionError' || e.type === 'RulesetExecution') && e.rulesetId === ruleset.id));
    if (rulesetExecutions) {
      acc.push(...rulesetExecutions);
    }
    return acc;
  }, [])
    .sort((execA, execB) => execB.timestamp - execA.timestamp)
    .map((rulesetExecution) => {
      const rulesetInformation = rulesetMap[rulesetExecution.rulesetId];
      const isActive = lastActiveRulesets.find((r) => r.id === rulesetExecution.rulesetId);
      return {
        ...rulesetExecution,
        status: getStatus(rulesetExecution, !!isActive),
        isActive: !!isActive,
        rulesetInformation,
        rulesEvaluations: (rulesetExecution.rulesEvaluations || []).sort((evalA, evalB) =>
          (rulesetInformation?.rules.findIndex((r) => r.id === evalA.rule.id) || -1)
          - (rulesetInformation?.rules.findIndex((r) => r.id === evalB.rule.id) || -1)
        )
      };
    });
};
