import type { ActionBlock } from '../engine/index';

/**
 * Content of action that updates the configuration
 * @deprecated use the one exposed by `@o3r/configuration` module. Will be removed in Otter v12.
 */
export interface ActionUpdateConfigBlock extends ActionBlock {
  actionType: 'UPDATE_CONFIG';
  library: string;
  component: string;
  property: string;
}

/**
 * Content of action that updates an asset
 * @deprecated use the one exposed by `@o3r/dynamic-content` module. Will be removed in Otter v12.
 */
export interface ActionUpdateAssetBlock extends ActionBlock {
  actionType: 'UPDATE_ASSET';
  asset: string;
  value: string;
}

/**
 * Content of action that updates localization
 * @deprecated use the one exposed by `@o3r/localization` module. Will be removed in Otter v12.
 */
export interface ActionUpdateLocalisationBlock extends ActionBlock {
  actionType: 'UPDATE_LOCALISATION';
  key: string;
  value: string;
}

/**
 * Content of action that updates a placeholder
 * @deprecated use the one exposed by `@o3r/components` module. Will be removed in Otter v12.
 */
export interface ActionUpdatePlaceholderBlock extends ActionBlock {
  actionType: 'UPDATE_PLACEHOLDER';
  placeholderId: string;
  value: string;
}

/**
 * Type that regroups all different kind of actions
 * @deprecated will be removed in Otter v12.
 */
export type ActionOverrideBlock =
  ActionUpdateConfigBlock |
  ActionUpdateAssetBlock |
  ActionUpdateLocalisationBlock |
  ActionUpdatePlaceholderBlock;
