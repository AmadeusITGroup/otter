import type {
  Vector,
} from '@ama-styling/figma-sdk';

/**
 * Convert vector to angle
 * @param param0 Vector
 * @param param0.0 Position Vector !
 * @param param0.1 Position Vector 2
 */
export const vectorToAngle = ([p1, p2]: Vector[]) => {
  return Math.floor(Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI) + 90;
};
