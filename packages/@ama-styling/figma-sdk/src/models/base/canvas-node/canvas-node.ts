/**
 * Model: CanvasNode
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ExportSetting } from '../export-setting';
import { FlowStartingPoint } from '../flow-starting-point';
import { IsLayerTraitBoundVariables } from '../is-layer-trait-bound-variables';
import { Measurement } from '../measurement';
import { PrototypeDevice } from '../prototype-device';
import { RGBA } from '../r-g-b-a';
import { SubcanvasNode } from '../subcanvas-node';

export interface CanvasNode {
  /** A string uniquely identifying this node within the document. */
  id: string;
  /** The name given to the node by the user in the tool. */
  name: string;
  /** @see TypeEnum */
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
  /** List of SubcanvasNodes */
  children: SubcanvasNode[];
  /** @see RGBA */
  backgroundColor: RGBA;
  /** Node ID that corresponds to the start frame for prototypes. This is deprecated with the introduction of multiple flows. Please use the `flowStartingPoints` field. */
  prototypeStartNodeID: string;
  /** An array of flow starting points sorted by its position in the prototype settings panel. */
  flowStartingPoints: FlowStartingPoint[];
  /** @see PrototypeDevice */
  prototypeDevice: PrototypeDevice;
  /** The background color of the prototype (currently only supports a single solid color paint). */
  prototypeBackgrounds?: RGBA[];
  /** List of Measurements */
  measurements?: Measurement[];
}

export type TypeEnum = 'CANVAS';
export type ScrollBehaviorEnum = 'SCROLLS' | 'FIXED' | 'STICKY_SCROLLS';

