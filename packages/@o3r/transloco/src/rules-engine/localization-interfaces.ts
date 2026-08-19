import type {
  RulesEngineAction,
} from '@o3r/core';

/** Action type to update localization via the rules engine */
export const RULES_ENGINE_LOCALIZATION_UPDATE_ACTION_TYPE = 'UPDATE_LOCALIZATION';

/**
 * Content of action that updates localization
 */
export interface ActionUpdateLocalizationBlock extends RulesEngineAction {
  /** Type of the action */
  actionType: typeof RULES_ENGINE_LOCALIZATION_UPDATE_ACTION_TYPE;
  /** Localization key to override */
  key: string;
  /** New value for the localization key */
  value: string;
}
