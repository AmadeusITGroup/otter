import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import {
  updateO3rMetricsConfig
} from './v11.3/index';

/**
 * update of Otter library V11.3
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- version in the function name
export function updateV11_3(): Rule {
  const updateRules: Rule[] = [
    updateO3rMetricsConfig
  ];

  return chain(updateRules);
}
