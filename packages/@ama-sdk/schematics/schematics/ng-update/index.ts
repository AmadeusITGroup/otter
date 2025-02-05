/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import type { Rule } from '@angular-devkit/schematics';
import {
  updateV10_0 as tsUpdateV10_0,
  updateV10_1 as tsUpdateV10_1,
  updateV10_3 as tsUpdateV10_3,
  updateV11_0 as tsUpdateV11_0
} from './typescript';
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

/**
 * update of Otter library V10.1
 */
export function updateV10_1(): Rule {
  return (tree, context) => {
    if (isTypescriptSdk(tree)) {
      return tsUpdateV10_1()(tree, context);
    }

    return tree;
  };
}

/**
 * update of Otter library V10.3
 */
export function updateV10_3(): Rule {
  return (tree, context) => {
    if (isTypescriptSdk(tree)) {
      return tsUpdateV10_3()(tree, context);
    }

    return tree;
  };
}

/**
 * update of Otter library V11.0
 */
export function updateV11_0(): Rule {
  return (tree, context) => {
    if (isTypescriptSdk(tree)) {
      return tsUpdateV11_0()(tree, context);
    }

    return tree;
  };
}
