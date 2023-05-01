import { createFeatureSelector, createSelector } from '@ngrx/store';
import { computeItemIdentifier } from '@o3r/core';
import type { Ruleset } from '../../engine';
import { rulesetsAdapter } from './rulesets.reducer';
import { RULESETS_STORE_NAME, RulesetsState } from './rulesets.state';

const {selectIds, selectEntities, selectAll, selectTotal} = rulesetsAdapter.getSelectors();

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
 *
 * @param d
 */
const isValidDate = (d: any) => !isNaN(d) && d instanceof Date;

/**
 * Returns only the rulesets ids which are not onDemand and in the validity range
 * OnDemand takes precedence over validity range.
 * Only if the ruleset is NOT onDemand (this means it is taken into consideration for the runs), the validity is checked
 */
export const selectActiveRuleSets = createSelector(
  selectAllRulesets,
  (ruleSets) => ruleSets.filter((ruleSet: Ruleset) => {

    if (ruleSet.linkedComponent) {
      return false;
    }

    const validity = ruleSet.validityRange;
    if (!validity || !validity.from && !validity.to) {
      return true;
    }

    const from = validity.from && new Date(validity.from);
    const to = validity.to && new Date(validity.to);

    if (to && !isValidDate(to) || from && !isValidDate(from)) {
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
  }).map((ruleSet: Ruleset) => ruleSet.id));

/**
 * Select the map of ruleSet to activate based on the component computed name
 */
export const selectRuleSetLinkComponents = createSelector(
  selectAllRulesets,
  (ruleSets) =>
    ruleSets
      .reduce((acc: Record<string, string[]>, ruleSet: Ruleset) => {
        if (!ruleSet.linkedComponent) {
          return acc;
        }
        const configName = computeItemIdentifier(ruleSet.linkedComponent.name, ruleSet.linkedComponent.library);
        acc[configName] ||= [];
        acc[configName].push(ruleSet.id);
        return acc;
      }, {})
);
