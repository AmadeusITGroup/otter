/**
 * Model: BasePaint
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlendMode } from '../blend-mode';

export interface BasePaint {
  /** Is the paint enabled? */
  visible?: boolean;
  /** Overall opacity of paint (colors within the paint can also have opacity values which would blend with this) */
  opacity?: number;
  /** @see BlendMode */
  blendMode: BlendMode;
}


