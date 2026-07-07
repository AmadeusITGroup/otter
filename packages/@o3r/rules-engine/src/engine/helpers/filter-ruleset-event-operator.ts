import {
  combineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import {
  RulesetExecutor,
} from '../ruleset-executor';

/**
 * Filter the actions outputted by the rules engine, based on active rulesets
 * @param restrictiveRuleSets list of rules sets to get the event stream for
 */
export function filterRulesetsEventStream(restrictiveRuleSets?: string[]) {
  return (source$: Observable<Record<string, RulesetExecutor>>) => source$.pipe(
    switchMap((ruleSetExecutorMap) => {
      const rulesets = Object.keys(ruleSetExecutorMap).map((rulesetId) => ruleSetExecutorMap[rulesetId].engineRuleset);
      const activeRulesets = restrictiveRuleSets
        ? Object.values(rulesets).filter((ruleSet) => restrictiveRuleSets.includes(ruleSet.id))
        : Object.values(rulesets);

      return activeRulesets?.length > 0
        ? combineLatest(activeRulesets.map((ruleset) => ruleset.rulesResultsSubject$)).pipe(
          map((item) => item.reduce((acc, currentValue) => {
            acc.push(...currentValue);
            return acc;
          }, [])))
        : of([]);
    }),
    shareReplay(1)
  );
}
