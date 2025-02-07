import type {
  RulesEngineAction,
} from '@o3r/core';

/** ActionUpdateConfigurationBlock  */
export const RULES_ENGINE_CONFIGURATION_UPDATE_ACTION_TYPE = 'UPDATE_CONFIG';

/**
 * Content of action that updates a Configuration
 */
export interface ActionUpdateConfigBlock extends RulesEngineAction {
  actionType: typeof RULES_ENGINE_CONFIGURATION_UPDATE_ACTION_TYPE;
  library: string;
  component: string;
  property: string;
}
