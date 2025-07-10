import type {
  Vector,
} from '@ama-styling/figma-sdk';

/**
 * Return the angle between the vector and the y axis of the screen.
 * Note that by definition, the axis is directed towards the bottom (position [0,0] is the top left corner of the screen.
 * This angle can be used for css angles such as gradient definition and transformation rotation.
 * @param param0 Vector
 * @param param0.0 Position Vector !
 * @param param0.1 Position Vector 2
 */
export const getAngleWithScreenYAxis = ([p1, p2]: Vector[]) => {
  return Math.floor(Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI) + 90;
};
