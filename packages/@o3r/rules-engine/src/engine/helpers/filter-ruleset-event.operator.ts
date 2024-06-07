import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { RulesetExecutor } from '../ruleset-executor';

/**
 * Filter the actions outputted by the rules engine, based on active rulesets
 * @param restrictiveRuleSets list of rules sets to get the event stream for
 */
export function filterRulesetsEventStream(restrictiveRuleSets?: string[]) {
  return (source$: Observable<Record<string, RulesetExecutor>>) => source$.pipe(
    switchMap((ruleSetExecutorMap) => {
      const rulesets = Object.keys(ruleSetExecutorMap).map((rulesetId) => ruleSetExecutorMap[rulesetId].engineRuleset);
      const activeRulesets = restrictiveRuleSets ?
        Object.values(rulesets).filter((ruleSet) => restrictiveRuleSets.indexOf(ruleSet.id) > -1) :
        Object.values(rulesets);

      return combineLatest(activeRulesets.map((ruleset) => ruleset.rulesResultsSubject$)).pipe(
        map((item) => item.reduce((acc, currentValue) => {
          acc.push(...currentValue);
          return acc;
        }, [])));
    }),
    shareReplay(1)
  );
}
