import type {
  StyleType,
} from '@ama-styling/figma-sdk';

/** List of style files as specified in the manifest */
export interface ManifestStyle {
  /** Text */
  text?: string[];
  /** Color */
  color?: string[];
  /** Effect */
  effect?: string[];
  /** Grid */
  grid?: string[];
}

/** List of available type and their names in Design Token */
export const styleTypeMapping: Readonly<Record<StyleType, keyof ManifestStyle>> = {
  FILL: 'color',
  TEXT: 'text',
  EFFECT: 'effect',
  GRID: 'grid'
} as const;
