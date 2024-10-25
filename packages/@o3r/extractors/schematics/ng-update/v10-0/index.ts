import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import {
  updateConfigurationExtractorCategories
} from './configuration-extractor-categories/configuration-extractor-categories';

/**
 * Default 10.0.0 update function
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
export function updateV10_0(): Rule {
  return (tree, context) => {
    const updateRules: Rule[] = [
      updateConfigurationExtractorCategories()
    ];

    return chain(updateRules)(tree, context);
  };
}
