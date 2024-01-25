import { chain, type Rule } from '@angular-devkit/schematics';
import { registerGenerateCssBuilder } from './register-generate-css';
import { extractToken } from '../extract-token';

/**
 * Add Otter design to an Angular Project
 * @param options
 */
export function ngAdd(): Rule {
  /* ng add rules */
  return chain([
    registerGenerateCssBuilder(),
    extractToken({ componentFilePatterns: ['**/*.scss'], includeTags: true })
  ]);
}
