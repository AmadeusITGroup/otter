import type { ActionBlock } from '../engine/index';

/**
 * Content of action that updates the configuration
 */
export interface ActionUpdateConfigBlock extends ActionBlock {
  actionType: 'UPDATE_CONFIG';
  library: string;
  component: string;
  property: string;
}

/**
 * Content of action that updates an asset
 */
export interface ActionUpdateAssetBlock extends ActionBlock {
  actionType: 'UPDATE_ASSET';
  asset: string;
  value: string;
}

/**
 * Content of action that updates localization
 */
export interface ActionUpdateLocalisationBlock extends ActionBlock {
  actionType: 'UPDATE_LOCALISATION';
  key: string;
  value: string;
}

/**
 * Content of action that updates a placeholder
 */
export interface ActionUpdatePlaceholderBlock extends ActionBlock {
  actionType: 'UPDATE_PLACEHOLDER';
  placeholderId: string;
  value: string;
}

/**
 * Type that regroups all different kind of actions
 */
export type ActionOverrideBlock =
  ActionUpdateConfigBlock |
  ActionUpdateAssetBlock |
  ActionUpdateLocalisationBlock |
  ActionUpdatePlaceholderBlock;
