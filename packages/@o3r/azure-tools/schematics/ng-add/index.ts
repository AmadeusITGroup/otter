import { noop } from '@angular-devkit/schematics';
import type { Rule } from '@angular-devkit/schematics';

/**
 * Add Otter azure-tools to an Angular Project
 *
 * @param options
 */
export function ngAdd(): Rule {
  /* ng add rules */
  return noop();
}
