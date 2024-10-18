/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import {
  updateScssImports
} from './v10.0/update-scss-imports';

/**
 * update of Otter library V10.0
 */
export function updateV10_0(): Rule {
  const updateRules: Rule[] = [
    updateScssImports()
  ];

  return chain(updateRules);
}
