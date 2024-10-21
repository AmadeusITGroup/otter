// TODO helpers needs to be moved into @o3r/design (https://github.com/AmadeusITGroup/otter/issues/1685)
import TinyColor from 'tinycolor2';

/**
 * Material palette variants
 */
export enum PaletteVariant {
  'V50' = '50',
  'V100' = '100',
  'V200' = '200',
  'V300' = '300',
  'V400' = '400',
  'V500' = '500',
  'V600' = '600',
  'V700' = '700',
  'V800' = '800',
  'V900' = '900',
  'A100' = 'A100',
  'A200' = 'A200',
  'A400' = 'A400',
  'A700' = 'A700'
}

/**
 * Default Material palette variant
 */
export const DEFAULT_PALETTE_VARIANT: PaletteVariant = PaletteVariant.V500;

/* eslint-disable @typescript-eslint/naming-convention */
const SATURATION_VALUES: Record<PaletteVariant, number> = {
  '50': 0.91,
  '100': 0.98,
  '200': 0.96,
  '300': 0.95,
  '400': 0.96,
  '500': 1,
  '600': 1,
  '700': 0.99,
  '800': 0.89,
  '900': 0.86,
  'A100': 1,
  'A200': 1,
  'A400': 1,
  'A700': 1
};

const LIGHTNESS_VALUES: Record<PaletteVariant, number> = {
  '50': 0.12,
  '100': 0.3,
  '200': 0.5,
  '300': 0.7,
  '400': 0.86,
  '500': 1,
  '600': 0.87,
  '700': 0.66,
  '800': 0.45,
  '900': 0.16,
  'A100': 0.76,
  'A200': 0.64,
  'A400': 0.49,
  'A700': 0.44
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Returns palette colors from one color
 * Logic inspired from https://github.com/Artik-Man/material-theme-creator
 * @param colorHex
 */
export const getPaletteColors = (colorHex: string): Record<string, string> => {
  const colorHsl = new TinyColor(colorHex).toHsl();
  return Object.values(PaletteVariant).reduce((acc: Record<string, string>, variant: PaletteVariant) => {
    let s = colorHsl.s;
    let l = colorHsl.l * 100;
    if (variant.startsWith('A')) { // A100, A200, A400, A700
      s = SATURATION_VALUES[variant];
      l = LIGHTNESS_VALUES[variant] * 100;
    } else if (+variant < +DEFAULT_PALETTE_VARIANT) { // 50, 100, 200, 300, 400
      s = colorHsl.s * SATURATION_VALUES[variant];
      l = (colorHsl.l * 100 - 100) * LIGHTNESS_VALUES[variant] + 100;
    } else if (+variant > +DEFAULT_PALETTE_VARIANT) { // 600, 700, 800, 900
      s = (1 - SATURATION_VALUES[variant]) + SATURATION_VALUES[variant] * colorHsl.s;
      l = (1 - LIGHTNESS_VALUES[variant]) * colorHsl.l * colorHsl.l * 100 + LIGHTNESS_VALUES[variant] * colorHsl.l * 100;
    }
    acc[variant] = new TinyColor(`hsl(${colorHsl.h}, ${s * 100}%, ${l}%)`).toHexString();
    return acc;
  }, {});
};

/**
 * Get the best contrasted color between white and black
 * @param color
 */
export const getBestColorContrast = (color: string) => {
  const blackReadability = TinyColor.readability(color, 'black');
  const whiteReadability = TinyColor.readability(color, 'white');
  return blackReadability > whiteReadability ? 'black' : 'white';
};

/**
 * https://webaim.org/articles/contrast/
 * Compute accessibility score for color contrast
 * @param color1
 * @param color2
 * @param textSize
 */
export const getAccessibilityContrastScore = (color1: string, color2: string, textSize: 'small' | 'large') => {
  const readability = TinyColor.readability(color1, color2);
  if (readability >= 7) {
    return 'AAA';
  } else if (readability >= 4.5) {
    return textSize === 'small' ? 'AA' : 'AAA';
  } else if (readability >= 3 && textSize === 'large') {
    return 'AA';
  }
  return '';
};
