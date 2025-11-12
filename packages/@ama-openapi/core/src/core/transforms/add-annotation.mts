import {
  posix,
} from 'node:path';
import {
  MASKED_PROPERTY_KEY,
  SOURCE_PROPERTY_KEY,
  TOUCHED_PROPERTY_KEY,
  VERSION_PROPERTY_KEY,
} from '../../constants.mjs';
import type {
  Context,
} from '../../context.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

type AdditionalAnnotation = {
  [MASKED_PROPERTY_KEY]: boolean;
  [TOUCHED_PROPERTY_KEY]: boolean;
  [SOURCE_PROPERTY_KEY]: string;
  [VERSION_PROPERTY_KEY]: string;
};

/**
 * Add annotation to the specification indicating its source, version, and if it was masked
 * @param specification
 * @param retrievedModel
 * @param context
 */
export const addAnnotation = <S extends object>(specification: S, retrievedModel: RetrievedDependencyModel, context: Context): S & AdditionalAnnotation => {
  const { logger } = context;
  const { artifactName, version, transform } = retrievedModel;
  logger?.debug?.(`Adding annotation to model from ${artifactName} at ${retrievedModel.model.path}`);
  return {
    ...specification,
    [SOURCE_PROPERTY_KEY]: posix.join(artifactName, retrievedModel.model.path),
    [VERSION_PROPERTY_KEY]: version,
    [MASKED_PROPERTY_KEY]: !!transform?.mask,
    [TOUCHED_PROPERTY_KEY]: !!transform
  };
};
