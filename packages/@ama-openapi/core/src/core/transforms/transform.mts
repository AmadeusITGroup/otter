import {
  isAbsolute,
} from 'node:path';
import type {
  Context,
} from '../../context.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

/**
 * Transform a specification with specified transformation function
 */
export type Transform<S extends object = object, T = any> = (specification: S, retrievedModel: RetrievedDependencyModel, context: Context) => T | Promise<T>;

/**
 *  Determine if a path is relative
 * @param path
 */
export const isRelativePath = (path: string): boolean => {
  return !URL.canParse(path) && !isAbsolute(path);
};
