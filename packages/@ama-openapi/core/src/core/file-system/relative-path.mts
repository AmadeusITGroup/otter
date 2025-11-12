import {
  isAbsolute,
} from 'node:path/posix';

/**
 *  Determine if a path is relative
 * @param path
 */
export const isRelativePath = (path: string): boolean => {
  return !URL.canParse(path) && !isAbsolute(path);
};
