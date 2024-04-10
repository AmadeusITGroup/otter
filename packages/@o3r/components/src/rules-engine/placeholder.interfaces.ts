import type { RulesEngineAction } from '@o3r/core';
import type { PlaceholderUrlUpdate } from '@o3r/components';

/** ActionUpdatePlaceholderBlock  */
export const RULES_ENGINE_PLACEHOLDER_UPDATE_ACTION_TYPE = 'UPDATE_PLACEHOLDER';

/**
 * Content of action that updates a placeholder
 */
export interface ActionUpdatePlaceholderBlock extends RulesEngineAction<typeof RULES_ENGINE_PLACEHOLDER_UPDATE_ACTION_TYPE, string>, PlaceholderUrlUpdate {
}
