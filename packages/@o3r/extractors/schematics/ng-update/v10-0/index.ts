/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import { chain, Rule } from '@angular-devkit/schematics';
import { updateConfigurationExtractorCategories } from './configuration-extractor-categories/configuration-extractor-categories';

/**
 * Default 10.0.0 update function
 */
export function updateV10_0(): Rule {
  return (tree, context) => {

    const updateRules: Rule[] = [
      updateConfigurationExtractorCategories()
    ];

    return chain(updateRules)(tree, context);
  };
}
