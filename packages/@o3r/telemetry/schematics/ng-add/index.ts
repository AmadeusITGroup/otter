import { noop, Rule } from '@angular-devkit/schematics';
import type { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter telemetry to an Otter Project
 * @param options
 */
export function ngAdd(_options: NgAddSchematicsSchema): Rule {
  return noop();
}
