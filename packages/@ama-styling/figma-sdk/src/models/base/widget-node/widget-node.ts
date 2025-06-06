/**
 * Model: WidgetNode
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ExportSetting } from '../export-setting';
import { IsLayerTraitBoundVariables } from '../is-layer-trait-bound-variables';
import { SubcanvasNode } from '../subcanvas-node';

export interface WidgetNode {
  /** A string uniquely identifying this node within the document. */
  id: string;
  /** The name given to the node by the user in the tool. */
  name: string;
  /** The type of this node, represented by the string literal \"WIDGET\" */
  type: TypeEnum;
  /** Whether or not the node is visible on the canvas. */
  visible?: boolean;
  /** If true, layer is locked and cannot be edited */
  locked?: boolean;
  /** Whether the layer is fixed while the parent is scrolling */
  isFixed?: boolean;
  /** How layer should be treated when the frame is resized */
  scrollBehavior: ScrollBehaviorEnum;
  /** The rotation of the node, if not 0. */
  rotation?: number;
  /** A mapping of a layer's property to component property name of component properties attached to this node. The component property name can be used to look up more information on the corresponding component's or component set's componentPropertyDefinitions. */
  componentPropertyReferences?: { [key: string]: string; };
  /** Data written by plugins that is visible only to the plugin that wrote it. Requires the `pluginData` to include the ID of the plugin. */
  pluginData?: any;
  /** Data written by plugins that is visible to all plugins. Requires the `pluginData` parameter to include the string \"shared\". */
  sharedPluginData?: any;
  /** @see IsLayerTraitBoundVariables */
  boundVariables?: IsLayerTraitBoundVariables;
  /** A mapping of variable collection ID to mode ID representing the explicitly set modes for this node. */
  explicitVariableModes?: { [key: string]: string; };
  /** An array of export settings representing images to export from the node. */
  exportSettings?: ExportSetting[];
  /** An array of nodes that are direct children of this node */
  children: SubcanvasNode[];
}

export type TypeEnum = 'WIDGET';
export type ScrollBehaviorEnum = 'SCROLLS' | 'FIXED' | 'STICKY_SCROLLS';

