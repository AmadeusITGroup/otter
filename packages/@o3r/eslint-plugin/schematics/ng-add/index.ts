import {
  noop,
} from '@angular-devkit/schematics';
import type {
  Rule,
} from '@angular-devkit/schematics';

/**
 * Add Otter eslint-plugin to an Angular Project
 */
export function ngAdd(): Rule {
  /* ng add rules */
  return noop();
}
