/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import { Rule, Tree } from '@angular-devkit/schematics';
import { updateV10_0 as tsUpdateV10_0 } from './typescript';

/**
 * Determine if the script is run in a Typescript SDK
 * @param tree
 */
const isTypescriptSdk = (tree: Tree) => {
  return tree.exists('/tsconfig.json');
};

/**
 * update of Otter library V10.0
 */
export function updateV10_0(): Rule {
  return (tree, context) => {
    if (isTypescriptSdk(tree)) {
      return tsUpdateV10_0()(tree, context);
    }

    return tree;
  };
}
