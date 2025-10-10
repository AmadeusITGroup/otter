import {
  deserialize,
  serialize,
} from './loader.mjs';

const MASK_PROPERTY_NAME = 'x-internal-masked';
const SOURCE_PROPERTY_NAME = 'x-internal-source';

/**
 * Recursively apply the mask to model properties
 * @param modelProperties
 * @param maskProperties
 * @returns
 */
const maskModelProperties = (modelProperties: any, maskProperties: any): any => {
  return Object.fromEntries(
    Object.entries(modelProperties)
      .filter(([key]) => key in maskProperties && maskProperties[key] !== false)
      .map(([key, value]) =>
        typeof maskProperties[key] === 'object' ? [key, maskModelProperties(value, maskProperties[key])] : [key, value]
      )
  );
};

/**
 * Apply the mask to the model
 * @param model
 * @param mask
 * @returns
 */
const applyMask = (model: any, url: string, mask?: any): any => {
  const result = { ...model };
  result[MASK_PROPERTY_NAME] = !!mask;
  result[SOURCE_PROPERTY_NAME] = url;

  if (!mask) {
    return result;
  }

  if (mask.properties && result.properties) {
    mask.properties = maskModelProperties(result.properties, mask.properties);
  }

  const maskAdditionalProperties = Object.entries(mask)
    .filter(([key]) => key !== 'properties');
  if (maskAdditionalProperties.length > 0) {
    delete result.type;
    delete result.properties;

    for (const [key, value] of maskAdditionalProperties) {
      if (typeof value === 'object') {
        result[key] = Array.isArray(value)
          ? value.map((subMask) => applyMask(mask.properties, subMask))
          : value && Object.fromEntries(Object.entries(value).map(([maskKey, subMask]) => ([maskKey, applyMask(mask.properties, subMask)])));
      } else {
        result[key] = value;
      }
    }
  }

  return result;
};

/**
 * Apply the mask to the model content
 * @param modelContent
 * @param maskObj
 * @returns
 */
export const maskModelContent = (modelContent: string, url: string, maskObj?: any): string => {
  const { format, obj: modelObj } = deserialize(modelContent);
  return serialize(format, applyMask(modelObj, url, maskObj));
};
