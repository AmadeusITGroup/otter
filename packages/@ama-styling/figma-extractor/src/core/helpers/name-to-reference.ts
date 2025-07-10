import {
  VARIABLE_NAME_PATH_SEPARATOR,
} from '../constants';

/**
 * Converts a given name string into a reference
 * @param name The input name string to be converted into a reference.
 */
export const convertNameToReference = (name: string) => name.split(VARIABLE_NAME_PATH_SEPARATOR)
  .map((part) => part.replace(/\s/g, '-'))
  .join('.');
