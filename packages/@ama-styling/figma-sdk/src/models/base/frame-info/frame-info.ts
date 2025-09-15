/**
 * Model: FrameInfo
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { FrameInfoContainingComponentSet } from '../frame-info-containing-component-set';
import { FrameInfoContainingStateGroup } from '../frame-info-containing-state-group';

/**
 * Data on the frame a component resides in.
 */
export interface FrameInfo {
  /** The ID of the frame node within the file. */
  nodeId?: string;
  /** The name of the frame node. */
  name?: string;
  /** The background color of the frame node. */
  backgroundColor?: string;
  /** The ID of the page containing the frame node. */
  pageId: string;
  /** The name of the page containing the frame node. */
  pageName: string;
  /** @see FrameInfoContainingStateGroup */
  containingStateGroup?: FrameInfoContainingStateGroup;
  /** @see FrameInfoContainingComponentSet */
  containingComponentSet?: FrameInfoContainingComponentSet;
}


