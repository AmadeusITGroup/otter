import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  updateScssImports,
} from './v10.0/update-scss-imports';

/**
 * update of Otter library V10.0
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
export function updateV10_0(): Rule {
  const updateRules: Rule[] = [
    updateScssImports()
  ];

  return chain(updateRules);
}
