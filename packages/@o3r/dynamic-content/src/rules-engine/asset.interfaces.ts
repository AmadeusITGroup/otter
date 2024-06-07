import type { RulesEngineAction } from '@o3r/core';

/** ActionUpdateAssetBlock  */
export const RULES_ENGINE_ASSET_UPDATE_ACTION_TYPE = 'UPDATE_ASSET';

/**
 * Content of action that updates asset
 */
export interface ActionUpdateAssetBlock extends RulesEngineAction {
  actionType: typeof RULES_ENGINE_ASSET_UPDATE_ACTION_TYPE;
  asset: string;
  value: string;
}
