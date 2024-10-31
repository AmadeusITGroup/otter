import type {
  Rule
} from '@angular-devkit/schematics';
import {
  isTypescriptSdk
} from '../helpers/is-typescript-project';
import {
  updateV10_0 as tsUpdateV10_0,
  updateV10_1 as tsUpdateV10_1,
  updateV10_3 as tsUpdateV10_3,
  updateV11_0 as tsUpdateV11_0,
  updateV11_4 as tsUpdateV11_4
} from './typescript';

/**
 * update of Otter library V10.0
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
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
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
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
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
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
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
export function updateV11_0(): Rule {
  return (tree, context) => {
    if (isTypescriptSdk(tree)) {
      return tsUpdateV11_0()(tree, context);
    }

    return tree;
  };
}

/**
 * update of Otter library V11.4
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version
export function updateV11_4(): Rule {
  return (tree, context) => {
    if (isTypescriptSdk(tree)) {
      return tsUpdateV11_4()(tree, context);
    }

    return tree;
  };
}
