/**
 * Model: NodeAction
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Navigation } from '../navigation';
import { NodeActionTransition } from '../node-action-transition';
import { Vector } from '../vector';

/**
 * An action that navigates to a specific node in the Figma viewer.
 */
export interface NodeAction {
  /** @see TypeEnum */
  type: TypeEnum;
  destinationId: string;
  /** @see Navigation */
  navigation: Navigation;
  /** @see NodeActionTransition */
  transition: NodeActionTransition;
  /** Whether the scroll offsets of any scrollable elements in the current screen or overlay are preserved when navigating to the destination. This is applicable only if the layout of both the current frame and its destination are the same. */
  preserveScrollPosition?: boolean;
  /** @see Vector */
  overlayRelativePosition?: Vector;
  /** When true, all videos within the destination frame will reset their memorized playback position to 00:00 before starting to play. */
  resetVideoPosition?: boolean;
  /** Whether the scroll offsets of any scrollable elements in the current screen or overlay reset when navigating to the destination. This is applicable only if the layout of both the current frame and its destination are the same. */
  resetScrollPosition?: boolean;
  /** Whether the state of any interactive components in the current screen or overlay reset when navigating to the destination. This is applicable if there are interactive components in the destination frame. */
  resetInteractiveComponents?: boolean;
}

export type TypeEnum = 'NODE';

