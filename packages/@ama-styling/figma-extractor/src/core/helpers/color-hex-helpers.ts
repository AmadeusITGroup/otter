import type {
  RGBA,
} from '@ama-styling/figma-sdk';

/**
 * Converts a color numeric value to its corresponding hexadecimal color code.
 * @param color value of the color composite
 */
export const getColorHex = (color: number) => {
  if (color < 0 || color > 1) {
    throw new Error('invalid color format');
  }
  const colorHex = (+(color * 255).toFixed(0)).toString(16);
  return colorHex.length > 1 ? colorHex : `0${colorHex}`;
};

/**
 * Convert RGBA to color string
 * @param value RGBA base color
 */
export const getRgbaColorHex = (value: RGBA) => `#${getColorHex(value.r)}${getColorHex(value.g)}${getColorHex(value.b)}${value.a === 1 ? '' : getColorHex(value.a)}`;
