import { EntityState } from '@ngrx/entity';
import { AsyncStoreItem } from '@o3r/core';
import type { Ruleset } from '../../engine';

/**
 * Rulesets model
 */
export interface RulesetsModel extends Ruleset {
}

/**
 * Rulesets state details
 */
export interface RulesetsStateDetails extends AsyncStoreItem {
}

/**
 * Rulesets store state
 */
export interface RulesetsState extends EntityState<RulesetsModel>, RulesetsStateDetails {
}

/**
 * Name of the Rulesets Store
 */
export const RULESETS_STORE_NAME = 'rulesets';

/**
 * Rulesets Store Interface
 */
export interface RulesetsStore {
  /** Rulesets state */
  [RULESETS_STORE_NAME]: RulesetsState;
}
