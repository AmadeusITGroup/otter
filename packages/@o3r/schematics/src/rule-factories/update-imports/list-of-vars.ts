/**
 * Represents an element that is exposed in a Sass import.
 */
export interface SassImportExposedElement {
  /** The name of the exposed element */
  value: string;
  /** The type of the exposed element, either 'function' or 'var' */
  type: 'function' | 'var';
  /** The name of the replacement element, if any */
  replacement?: string | undefined;
}

export const listOfExposedElements: SassImportExposedElement[] = [
  // utils
  { value: '$test-mode-enabled', type: 'var' },
  { value: 'error', type: 'function' },
  { value: 'get-mandatory', type: 'function' },
  { value: 'multi-map-merge', type: 'function' },
  { value: '$metadata-logging', type: 'var' },
  { value: '$debug', type: 'var' },
  { value: 'log-variable', type: 'function' },
  // theming mixins
  { value: 'apply-theme', type: 'function' },
  { value: 'override-theme', type: 'function' },
  // theming functions
  { value: 'generate-theme-variables', type: 'function' },
  { value: 'revert-palette', type: 'function' },
  { value: 'generate-theme', type: 'function' },
  { value: 'meta-theme-to-otter', type: 'function' },
  { value: 'meta-theme-to-material', type: 'function' },
  { value: 'o3r-var', type: 'function', replacement: 'variable' },
  { value: 'o3r-get', type: 'function', replacement: 'get' },
  { value: 'o3r-color', type: 'function', replacement: 'color' },
  { value: 'o3r-contrast', type: 'function', replacement: 'contrast' },
  { value: 'is-o3r-variable', type: 'function', replacement: 'is-variable' },
  // theming palettes
  { value: '$refx-primary', type: 'var', replacement: '$palettes-refx-primary' },
  { value: '$refx-highlight', type: 'var', replacement: '$palettes-refx-highlight' },
  { value: '$refx-accent', type: 'var', replacement: '$palettes-refx-accent' },
  { value: '$refx-warn', type: 'var', replacement: '$palettes-refx-warn' },
  { value: '$ama-highlight', type: 'var', replacement: '$palettes-ama-highlight' },
  { value: '$ama-accent', type: 'var', replacement: '$palettes-ama-accent' },
  { value: '$ama-primary', type: 'var', replacement: '$palettes-ama-primary' },
  { value: '$ama-warn', type: 'var', replacement: '$palettes-ama-warn' },
  // theming otter-theme
  { value: 'generate-otter-theme', type: 'function' },
  { value: 'generate-otter-dark-theme', type: 'function' },
  // theming dark-theme
  { value: '$private-dark-default', type: 'var' },
  { value: '$otter-dark-default', type: 'var' }
];
