import {
  relative,
} from 'node:path';
import type {
  Logger,
} from '../../logger.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

type ReferenceSpecification = {
  $ref: string;
  [x: string]: any;
};

/**
 * Transform the specification to a single reference if no transformation required
 * The process will keep the x-vendor properties from the retrieved model
 * @param specification
 * @param retrievedModel
 * @param logger
 */
export const toReference = <S extends object>(specification: S, retrievedModel: RetrievedDependencyModel, logger?: Logger): S | ReferenceSpecification => {
  if (retrievedModel.transform) {
    logger?.debug?.(`The specification ${retrievedModel.modelPath} has transform, the conversion to reference will be ignored`);
    return specification;
  }

  return {
    $ref: relative(retrievedModel.outputFilePath, retrievedModel.modelPath),
    ...Object.fromEntries(Object.entries(retrievedModel).filter(([key]) => key.startsWith('x-')))
  };
};
