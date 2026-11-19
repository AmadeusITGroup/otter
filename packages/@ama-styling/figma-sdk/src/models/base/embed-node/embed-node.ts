/**
 * Model: EmbedNode
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ExportSetting } from '../export-setting';
import { IsLayerTraitBoundVariables } from '../is-layer-trait-bound-variables';

export interface EmbedNode {
  /** A string uniquely identifying this node within the document. */
  id: string;
  /** The name given to the node by the user in the tool. */
  name: string;
  /** The type of this node, represented by the string literal "EMBED" */
  type: TypeEnum;
  /**
   * Whether or not the node is visible on the canvas.
   * @default true
   */
  visible?: boolean;
  /**
   * If true, layer is locked and cannot be edited
   * @default false
   */
  locked?: boolean;
  /**
   * Whether the layer is fixed while the parent is scrolling
   * @default false
   */
  isFixed?: boolean;
  /**
   * How layer should be treated when the frame is resized
   * @default 'SCROLLS'
   */
  scrollBehavior: ScrollBehaviorEnum;
  /**
   * The rotation of the node, if not 0.
   * @default 0
   */
  rotation?: number;
  /** A mapping of a layer's property to component property name of component properties attached to this node. The component property name can be used to look up more information on the corresponding component's or component set's componentPropertyDefinitions. */
  componentPropertyReferences?: Record<string, string>;
  /** Data written by plugins that is visible only to the plugin that wrote it. Requires the `pluginData` to include the ID of the plugin. */
  pluginData?: any;
  /** Data written by plugins that is visible to all plugins. Requires the `pluginData` parameter to include the string "shared". */
  sharedPluginData?: any;
  /** @see IsLayerTraitBoundVariables */
  boundVariables?: IsLayerTraitBoundVariables;
  /** A mapping of variable collection ID to mode ID representing the explicitly set modes for this node. */
  explicitVariableModes?: Record<string, string>;
  /** An array of export settings representing images to export from the node. */
  exportSettings?: ExportSetting[];
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['EMBED'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'EMBED';
/** Array of ScrollBehaviorEnum items */
export const LIST_SCROLL_BEHAVIOR_ENUM = ['SCROLLS', 'FIXED', 'STICKY_SCROLLS'] as const;

/** List of available values for ScrollBehaviorEnum */
export type ScrollBehaviorEnum = 'SCROLLS' | 'FIXED' | 'STICKY_SCROLLS';

