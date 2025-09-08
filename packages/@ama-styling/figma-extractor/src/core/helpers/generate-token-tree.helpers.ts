import {
  VARIABLE_NAME_PATH_SEPARATOR,
} from '../constants';
import type {
  DesignTokenTree,
} from '../interfaces';

/**
 * Generate a Design Token tree from the given variable list based on same {@link type}
 * @param variables List of variables to generate the tree from
 * @param type Type of the listed variables
 */
export const generateTokenTree = <T>(variables: Record<string, { value: T; description?: string }>, type: string): DesignTokenTree<T> => {
  return Object.entries(variables)
    .reduce((acc, [name, { value, description }]) => {
      const splitName = name.split(VARIABLE_NAME_PATH_SEPARATOR);
      let curr: any = acc;
      // walk through the return object to create object tree branch (if it does not exist) and point the curr variable to the latest tree item to set the shadow to
      splitName.forEach((n) => curr = curr[n] ||= {});
      Object.assign(curr, {
        $type: type,
        $description: description || undefined,
        $value: value
      });
      return acc;
    }, {} as DesignTokenTree<T>);
};
