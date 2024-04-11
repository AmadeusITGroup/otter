/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import { chain, type Rule } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import { addPresetsRenovate } from './v10.1/add-presets-renovate';

/**
 * Update of Otter Workspace V10.1
 */
function updateV10_1Fn(): Rule {
  const updateRules: Rule[] = [
    addPresetsRenovate()
  ];
  return chain(updateRules);
}

/**
 * Update of Otter Workspace V10.1
 */
export const updateV10_1 = createSchematicWithMetricsIfInstalled(updateV10_1Fn);
