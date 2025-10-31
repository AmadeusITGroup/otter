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
  Logger,
} from '../../logger.mjs';
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
 * @param _logger
 */
export const addAnnotation = <S extends object>(specification: S, retrievedModel: RetrievedDependencyModel, _logger?: Logger): S & AdditionalAnnotation => {
  const { artifactName, version, transform } = retrievedModel;
  return {
    ...specification,
    [SOURCE_PROPERTY_KEY]: posix.join(artifactName, retrievedModel.model.path),
    [VERSION_PROPERTY_KEY]: version,
    [MASKED_PROPERTY_KEY]: !!transform?.mask,
    [TOUCHED_PROPERTY_KEY]: !!transform
  };
};
