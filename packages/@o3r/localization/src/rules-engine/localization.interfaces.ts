import type {
  RulesEngineAction
} from '@o3r/core';

/** ActionUpdateLocalisationBlock  */
export const RULES_ENGINE_LOCALISATION_UPDATE_ACTION_TYPE = 'UPDATE_LOCALISATION';

/**
 * Content of action that updates localization
 */
export interface ActionUpdateLocalisationBlock extends RulesEngineAction {
  actionType: typeof RULES_ENGINE_LOCALISATION_UPDATE_ACTION_TYPE;
  key: string;
  value: string;
}
