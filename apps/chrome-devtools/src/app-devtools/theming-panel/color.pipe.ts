import {
  Pipe,
  type PipeTransform,
} from '@angular/core';
import TinyColor from 'tinycolor2';
import {
  getAccessibilityContrastScore,
  getBestColorContrast,
} from './color.helpers';

/**
 * Convert the color to hexadecimal format
 */
@Pipe({
  name: 'hexColor'
})
export class HexColorPipe implements PipeTransform {
  public transform(variableValue: string) {
    try {
      return new TinyColor(variableValue).toHexString();
    } catch {
      return null;
    }
  }
}

/**
 * Compute the best contrast for a color
 */
@Pipe({
  name: 'contrast'
})
export class ContrastPipe implements PipeTransform {
  public transform(color: string) {
    return getBestColorContrast(color);
  }
}

/**
 * https://webaim.org/articles/contrast/
 * Compute accessibility score for color contrast
 */
@Pipe({
  name: 'accessibilityContrastScore'
})
export class AccessibilityContrastScorePipe implements PipeTransform {
  public transform(color1: string, color2: string, textSize: 'small' | 'large') {
    return getAccessibilityContrastScore(color1, color2, textSize);
  }
}
