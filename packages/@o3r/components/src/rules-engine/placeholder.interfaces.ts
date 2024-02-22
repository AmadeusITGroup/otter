import type { RulesEngineAction } from '@o3r/core';

/** ActionUpdatePlaceholderBlock  */
export const RULES_ENGINE_PLACEHOLDER_UPDATE_ACTION_TYPE = 'UPDATE_PLACEHOLDER';

/**
 * Content of action that updates a placeholder
 */
export interface ActionUpdatePlaceholderBlock extends RulesEngineAction {
  actionType: typeof RULES_ENGINE_PLACEHOLDER_UPDATE_ACTION_TYPE;
  placeholderId: string;
  value: string;
  priority?: number;
}
