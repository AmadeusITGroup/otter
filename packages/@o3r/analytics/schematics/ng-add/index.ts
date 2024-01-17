import type { Rule } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';

/**
 * Add Otter analytics to an Angular Project
 */
function ngAddFn(): Rule {
  /* ng add rules */
  return () => {};
}

/**
 * Add Otter analytics to an Angular Project
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
