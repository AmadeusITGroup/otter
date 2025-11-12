import {
  dirname,
  posix,
  relative,
  sep,
} from 'node:path';
import {
  GENERATED_REF_PROPERTY_KEY,
} from '../../constants.mjs';
import type {
  Context,
} from '../../context.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';
import type {
  SpecificationFile,
} from './transform.mjs';

type ReferenceSpecification = {
  $ref: string;
  [GENERATED_REF_PROPERTY_KEY]: boolean;
  [x: string]: any;
};

/**
 * Transform the specification to a single reference if no transformation required
 * The process will keep the x-vendor properties from the retrieved model
 * @param specification
 * @param retrievedModel
 * @param context
 */
export const toReference = <S extends SpecificationFile>(specification: S, retrievedModel: RetrievedDependencyModel, context: Context): S | ReferenceSpecification => {
  const { logger } = context;
  if (retrievedModel.transform) {
    logger?.debug?.(`The specification ${retrievedModel.modelPath} has transform, the conversion to reference will be ignored`);
    return specification;
  }

  logger?.debug?.(`Converting specification ${retrievedModel.modelPath} to a $ref`);
  return {
    ...Object.fromEntries(Object.entries(retrievedModel).filter(([key]) => key.startsWith('x-'))),
    [GENERATED_REF_PROPERTY_KEY]: true,
    $ref: relative(dirname(retrievedModel.outputFilePath), retrievedModel.modelPath).replaceAll(sep, posix.sep)
  };
};
