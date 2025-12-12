import {
  dump,
  load,
} from 'js-yaml';
import type {
  RetrievedDependencyModel,
} from './manifest/extract-dependency-models.mjs';

/**
 * Deserialize the content of a model file
 * @param specification
 * @param model
 */
export const deserialize = (specification: string, model: RetrievedDependencyModel): any => {
  if (model.isInputJson) {
    return JSON.parse(specification);
  }
  return load(specification);
};

/**
 * Serialize an object into a model file content
 * @param specification
 * @param model
 */
export const serialize = (specification: any, model: RetrievedDependencyModel): string => {
  if (model.isOutputJson) {
    return JSON.stringify(specification, null, 2);
  }
  return dump(specification, { lineWidth: -1 });
};
