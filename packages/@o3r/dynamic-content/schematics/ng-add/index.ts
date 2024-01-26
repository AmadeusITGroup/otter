import { noop } from '@angular-devkit/schematics';
import type { Rule } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';

/**
 * Add Otter dynamic-content to an Angular Project
 */
function ngAddFn(): Rule {
  /* ng add rules */
  return noop();
}

/**
 * Add Otter dynamic-content to an Angular Project
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
