/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import {
  updateCmsJsonFile
} from './v10.0/update-cms-config';

/**
 * update of Otter library V10.0
 */
export function updateV10_0(): Rule {
  const updateRules: Rule[] = [
    updateCmsJsonFile()
  ];

  return chain(updateRules);
}
