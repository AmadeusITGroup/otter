/**
 * Model: DropShadowEffect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BaseShadowEffectBoundVariables } from '../base-shadow-effect-bound-variables';
import { BlendMode } from '../blend-mode';
import { RGBA } from '../r-g-b-a';
import { Vector } from '../vector';

export interface DropShadowEffect {
  /** @see RGBA */
  color: RGBA;
  /** @see BlendMode */
  blendMode: BlendMode;
  /** @see Vector */
  offset: Vector;
  /** Radius of the blur effect (applies to shadows as well) */
  radius: number;
  /** The distance by which to expand (or contract) the shadow.  For drop shadows, a positive `spread` value creates a shadow larger than the node, whereas a negative value creates a shadow smaller than the node.  For inner shadows, a positive `spread` value contracts the shadow. Spread values are only accepted on rectangles and ellipses, or on frames, components, and instances with visible fill paints and `clipsContent` enabled. When left unspecified, the default value is 0. */
  spread?: number;
  /** Whether this shadow is visible. */
  visible: boolean;
  /** @see BaseShadowEffectBoundVariables */
  boundVariables?: BaseShadowEffectBoundVariables;
  /** A string literal representing the effect's type. Always check the type before reading other properties. */
  type: TypeEnum;
  /** Whether to show the shadow behind translucent or transparent pixels */
  showShadowBehindNode: boolean;
}

export type TypeEnum = 'DROP_SHADOW';

