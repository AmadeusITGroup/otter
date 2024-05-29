/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import type { Rule } from '@angular-devkit/schematics';
import { updateV10_0 as tsUpdateV10_0 } from './typescript';
import { isTypescriptSdk } from '../helpers/is-typescript-project';

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
