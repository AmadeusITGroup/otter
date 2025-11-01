/* eslint-disable @typescript-eslint/no-unsafe-argument -- due to unknown object structure */
/* eslint-disable @typescript-eslint/no-unsafe-member-access -- due to unknown object structure */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- due to unknown object structure */

import type {
  Logger,
} from '../../logger.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

/**
 * Recursively apply the mask to model properties
 * @param modelProperties
 * @param maskProperties
 */
const maskModelProperties = (modelProperties: any, maskProperties: any): any => {
  return Object.fromEntries(
    Object.entries(modelProperties)
      .filter(([key]) => !!maskProperties && key in maskProperties && maskProperties[key] !== false)
      .map(([key, value]) =>
        typeof maskProperties[key] === 'object' ? [key, maskModelProperties(value, maskProperties[key])] : [key, value]
      )
  );
};

/**
 * Recursively apply the sub-mask to the specification
 * @param specification
 * @param mask
 */
const applySubMask = (specification: any, mask?: any): any => {
  const result: any = { ...specification };

  if (!mask || typeof mask !== 'object') {
    return result;
  }

  if ('properties' in mask && 'properties' in result) {
    result.properties = maskModelProperties(result.properties, mask.properties);
  }

  const maskAdditionalProperties = Object.entries(mask)
    .filter(([key]) => key !== 'properties');

  if (maskAdditionalProperties.length > 0) {
    delete (result as { type?: any }).type;
    delete (result as { properties?: any }).properties;

    for (const [key, value] of maskAdditionalProperties) {
      if (typeof value === 'object') {
        result[key] = Array.isArray(value)
          ? value.map((subMask): any => applyMask(result[key], subMask))
          : value && Object.fromEntries(Object.entries(value).map(([maskKey, subMask]) => ([maskKey, applyMask(result[key][maskKey], subMask)])));
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

/**
 * Apply the mask to the model
 * @param specification
 * @param retrievedModel
 * @param _logger
 */
export const applyMask = <S extends object>(specification: S, retrievedModel: RetrievedDependencyModel, _logger?: Logger): S => {
  if (!retrievedModel.transform) {
    return specification;
  }
  return applySubMask(specification, retrievedModel.transform.mask) as S;
};
