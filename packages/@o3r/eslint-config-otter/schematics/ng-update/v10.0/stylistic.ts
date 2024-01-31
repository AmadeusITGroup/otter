import { type Rule } from '@angular-devkit/schematics';
import { AddDevInstall } from '@o3r/schematics';

/**
 * Add Stylistic package in the dependencies
 * @param _tree
 * @param context
 */
export const addStylistic: Rule = (_tree, context) => {
  context.addTask(new AddDevInstall({
    packageName: '@stylistic/eslint-plugin-ts'
  }));
};
