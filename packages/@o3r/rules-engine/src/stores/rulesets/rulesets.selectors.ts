import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import {
  computeItemIdentifier,
} from '@o3r/core';
import type {
  Ruleset,
} from '../../engine';
import {
  rulesetsAdapter,
} from './rulesets.reducer';
import {
  RULESETS_STORE_NAME,
  RulesetsState,
} from './rulesets.state';

const { selectIds, selectEntities, selectAll, selectTotal } = rulesetsAdapter.getSelectors();

/** Select Rulesets State */
export const selectRulesetsState = createFeatureSelector<RulesetsState>(RULESETS_STORE_NAME);

/** Select the array of Rulesets ids */
export const selectRulesetsIds = createSelector(selectRulesetsState, selectIds);

/** Select the array of Rulesets */
export const selectAllRulesets = createSelector(selectRulesetsState, selectAll);

/** Select the dictionary of Rulesets entities */
export const selectRulesetsEntities = createSelector(selectRulesetsState, selectEntities);

/** Select the total Rulesets count */
export const selectRulesetsTotal = createSelector(selectRulesetsState, selectTotal);

/** Select the store pending status */
export const selectRulesetsStorePendingStatus = createSelector(selectRulesetsState, (state) => state.isPending || false);

/**
 * Check if the given value is a valid date
 * @param d
 */
const isValidDate = (d: any) => !Number.isNaN(d) && d instanceof Date;

/**
 * Returns the rulesets which are in the validity range, if provided
 */
export const selectRuleSetsInRange = createSelector(
  selectAllRulesets,
  (ruleSets) => ruleSets.filter((ruleSet: Ruleset) => {
    const validity = ruleSet.validityRange;
    if (!validity || (!validity.from && !validity.to)) {
      return true;
    }

    const from = validity.from && new Date(validity.from);
    const to = validity.to && new Date(validity.to);

    if ((to && !isValidDate(to)) || (from && !isValidDate(from))) {
      return false;
    }
    const time = Date.now();
    if (to && from) {
      return from.getTime() <= time && to.getTime() >= time;
    }

    if (from) {
      return from.getTime() <= time;
    }
    return to && to.getTime() >= time;
  })
);

/**
 * Returns the rulesets ids which are not onDemand and in the validity range
 */
export const selectActiveRuleSets = createSelector(
  selectRuleSetsInRange,
  (ruleSets) => ruleSets
    .filter((ruleSet: Ruleset) => (!ruleSet.linkedComponents?.or?.length))
    .map((ruleSet: Ruleset) => ruleSet.id));

/**
 * Assign component to RulesetIds Map
 * @param compName
 * @param library
 * @param ruleSetId
 * @param acc
 */
function linkComponentToRuleset(compName: string, library: string, ruleSetId: string, acc: Record<string, string[]> = {}) {
  const configName = computeItemIdentifier(compName, library);
  acc[ruleSetId] ||= [];
  acc[ruleSetId].push(configName);
}

/**
 * Select the map of ruleSets to activate based on linked components
 */
export const selectComponentsLinkedToRuleset = createSelector(
  selectRuleSetsInRange,
  (ruleSets) =>
    ruleSets
      .reduce((acc: { or: { [key: string]: string[] } }, ruleSet: Ruleset) => {
        if (!ruleSet.linkedComponents?.or || ruleSet.linkedComponents.or.length === 0) {
          return acc;
        }
        if (ruleSet.linkedComponents?.or?.length) {
          ruleSet.linkedComponents.or.forEach((linkComp) => {
            linkComponentToRuleset(linkComp.name, linkComp.library, ruleSet.id, acc.or);
          });
          return acc;
        }
        return acc;
      }, { or: {} })
);
