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
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
export function updateV10_0(): Rule {
  const updateRules: Rule[] = [
    updateCmsJsonFile()
  ];

  return chain(updateRules);
}
