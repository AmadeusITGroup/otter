import { chain, Rule } from '@angular-devkit/schematics';
import { updateThrowOnUndefinedCalls } from './throw-on-undefined/throw-on-undefined';

/**
 * Default 9.0.0 update function
 */
export function update(): Rule {
  return (tree, context) => {

    const updateRules: Rule[] = [
      updateThrowOnUndefinedCalls()
    ];

    return chain(updateRules)(tree, context);
  };
}
