/**
 * Model: TransitionSourceTrait
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { EasingType } from '../easing-type';
import { Interaction } from '../interaction';

export interface TransitionSourceTrait {
  /** Node ID of node to transition to in prototyping */
  transitionNodeID?: string;
  /** The duration of the prototyping transition on this node (in milliseconds). This will override the default transition duration on the prototype, for this node. */
  transitionDuration?: number;
  /** @see EasingType */
  transitionEasing?: EasingType;
  /** List of Interactions */
  interactions?: Interaction[];
}


