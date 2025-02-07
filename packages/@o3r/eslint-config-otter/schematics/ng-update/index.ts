import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  createSchematicWithMetricsIfInstalled,
} from '@o3r/schematics';
import {
  addStylistic,
} from './v10.0/stylistic';
import {
  updateEslintRecommended,
} from './v11.6/update-configs/update-configs';

/**
 * Update of Otter library V10.0
 */
function updateV100fn(): Rule {
  return (tree, context) => {
    const updateRules: Rule[] = [
      addStylistic
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * Update of Otter library V11.6
 */
function updateV116Fn(): Rule {
  return (tree, context) => {
    const updateRules: Rule[] = [
      updateEslintRecommended()
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * Update of Otter library V10.0
 */
export const updateV100 = createSchematicWithMetricsIfInstalled(updateV100fn);

/**
 * Update of Otter library V11.6
 */
export const updateV116 = createSchematicWithMetricsIfInstalled(updateV116Fn);
