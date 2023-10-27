import { chain, Rule } from '@angular-devkit/schematics';
import { updateThrowOnUndefinedCalls } from './throw-on-undefined/throw-on-undefined';
import { updateLocalizationImports } from './localization-imports/localization-imports';

/**
 * Default 9.0.0 update function
 */
export function update(): Rule {
  return (tree, context) => {

    const updateRules: Rule[] = [
      updateThrowOnUndefinedCalls(),
      updateLocalizationImports()
    ];

    return chain(updateRules)(tree, context);
  };
}
