import {
  CLOSING_SQUARE_BRACKET_URL_CODE,
  OPENING_SQUARE_BRACKET_URL_CODE,
  type ParamSerialization,
  PIPE_URL_CODE,
  type PrimitiveType,
  SPACE_URL_CODE,
  type SupportedParamType,
} from './param-serialization';

/** Specification of the parameter type for parameter deserialization */
export type ParamTypeForDeserialization = 'primitive' | 'array' | 'object';

/**
 * Split parameter elements by delimiter based on the serialization style (with removal of the prefix)
 * @param serializedParamValue serialized parameter value
 * @param paramSerialization parameter serialization
 */
function splitParamElements(serializedParamValue: string, paramSerialization: ParamSerialization) {
  switch (paramSerialization.style) {
    case 'simple': {
      return serializedParamValue.split(',').map((value) => decodeURIComponent(value));
    }
    case 'label': {
      // NOTE: Path parameters of style label are prefixed with a '.'
      return serializedParamValue.substring(1).split(paramSerialization.explode ? '.' : ',').map((value) => decodeURIComponent(value));
    }
    case 'matrix': {
      // NOTE: Path parameters of style matrix and exploded true are written like this: ';paramName=value1;paramName=value2'
      // NOTE: Path parameters of style matrix and exploded false are prefixed with a ';paramName=' and the values are separated by a ','
      return paramSerialization.explode
        ? serializedParamValue.substring(1).split(';').map((value) => decodeURIComponent(value.split('=')[1]))
        : serializedParamValue.split('=')[1].split(',').map((value) => decodeURIComponent(value));
    }
    case 'form': {
      // NOTE: Query parameters of style form and explode true are written like this: 'paramName=value1&paramName=value2&paramName=value3'
      // NOTE: Query parameters of style form and explode false are prefixed with the parameter name and delimited by a ','
      return paramSerialization.explode
        ? serializedParamValue.split('&').map((value) => decodeURIComponent(value.split('=')[1]))
        : serializedParamValue.split('=')[1].split(',').map((value) => decodeURIComponent(value));
    }
    case 'spaceDelimited': {
      // NOTE: Query parameters of style spaceDelimited and explode false are prefixed with the parameter name and delimited by the encoded space character
      // Here is an example of the format: 'paramName=value1%20value2%20value3'
      return paramSerialization.explode ? undefined : serializedParamValue.split('=')[1].split(SPACE_URL_CODE).map((value) => decodeURIComponent(value));
    }
    case 'pipeDelimited': {
      // NOTE: Query parameters of style spaceDelimited and explode false are prefixed with the parameter name and delimited by the encoded pipe character
      // Here is an example of the format: 'paramName=value1%7Cvalue2%7Cvalue3'
      return paramSerialization.explode ? undefined : serializedParamValue.split('=')[1].split(PIPE_URL_CODE).map((value) => decodeURIComponent(value));
    }
  }
}

/**
 * Create object from pairwise array - every other item of the array is a key and the following item is the corresponding value
 * @param splitObject
 */
function objectFromPairwiseArray(splitObject: string[]) {
  return splitObject.reduce((obj: { [key: string]: PrimitiveType }, currentValue, index, array) => {
    // NOTE: Every other item of the array is a key and the following item is the corresponding value
    if (index % 2 === 0) {
      obj[decodeURIComponent(currentValue)] = decodeURIComponent(array[index + 1]);
    }
    return obj;
  }, {} as { [key: string]: PrimitiveType });
}

/**
 * Deserialize query parameters of type array
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param serializedParamValue serialized query parameter value
 * @param paramSerialization parameter serialization
 */
function deserializeArrayQueryParams(serializedParamValue: string, paramSerialization: ParamSerialization) {
  return splitParamElements(serializedParamValue, paramSerialization);
}

/**
 * Deserialize query parameters of type object
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param serializedParamValue serialized query parameter value
 * @param paramSerialization parameter serialization
 */
function deserializeObjectQueryParams(serializedParamValue: string, paramSerialization: ParamSerialization) {
  // NOTE: Applies to the exploded styles 'form' and 'deepObject'
  if (paramSerialization.explode && (paramSerialization.style === 'form' || paramSerialization.style === 'deepObject')) {
    return serializedParamValue.split('&').reduce((obj: { [key: string]: PrimitiveType }, serializedProperty) => {
      const [key, value] = serializedProperty.split('=');
      // NOTE: The key of an object in deepObject style is surrounded by opening and closing square brackets
      const objKey = paramSerialization.style === 'deepObject' ? key.split(OPENING_SQUARE_BRACKET_URL_CODE)[1].split(CLOSING_SQUARE_BRACKET_URL_CODE)[0] : key;
      obj[decodeURIComponent(objKey)] = decodeURIComponent(value);
      return obj;
    }, {} as { [key: string]: PrimitiveType });
  }

  // NOTE: Applies to the non-exploded styles 'form', 'spaceDelimited', and 'pipeDelimited'
  if (paramSerialization.style !== 'deepObject' && !paramSerialization.explode) {
    // NOTE: The splitParamElements function is called since object query parameters can be split by delimiters based on the serialization style
    // NOTE: The deserialized value will exist since these exploded styles are supported
    const splitObject = splitParamElements(serializedParamValue, paramSerialization);
    return objectFromPairwiseArray(splitObject!);
  }
}

/**
 * Deserialize query parameters based on the values of exploded and style and the parameter type
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param serializedQueryParams serialized query parameters
 * @param queryParamSerialization query parameter serialization
 */
export function deserializeQueryParams<T extends { [key: string]: string }>(
  serializedQueryParams: T,
  queryParamSerialization: { [p in keyof T]: ParamSerialization & { paramType: ParamTypeForDeserialization } }
): { [p in keyof T]: SupportedParamType } {
  return Object.entries(serializedQueryParams).reduce((acc, [queryParamName, serializedParamValue]) => {
    const paramSerialization = queryParamSerialization[queryParamName];
    let deserializedValue: SupportedParamType;
    if (paramSerialization.paramType === 'array') {
      deserializedValue = deserializeArrayQueryParams(serializedParamValue, paramSerialization);
    } else if (paramSerialization.paramType === 'object') {
      deserializedValue = deserializeObjectQueryParams(serializedParamValue, paramSerialization);
    } else {
      // NOTE: Query parameters of type primitive are prefixed with the parameter name like this: 'paramName=value'
      deserializedValue = decodeURIComponent(serializedParamValue.split('=')[1]);
    }
    if (deserializedValue) {
      acc[queryParamName] = deserializedValue;
    } else {
      throw new Error(`Unable to deserialize query parameter ${queryParamName} since the combination explode=${paramSerialization.explode} and style='${paramSerialization.style}' is not supported.`);
    }
    return acc;
  }, {} as Record<string, SupportedParamType>) as { [p in keyof T]: SupportedParamType };
}

/**
 * Deserialize path parameters of type primitive
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param serializedParamValue serialized path parameter value
 * @param paramSerialization parameter serialization
 */
function deserializePrimitivePathParams(serializedParamValue: string, paramSerialization: ParamSerialization) {
  switch (paramSerialization.style) {
    case 'simple': {
      return decodeURIComponent(serializedParamValue);
    }
    case 'label': {
      // NOTE: Path parameters of style label are prefixed with a '.'
      return decodeURIComponent(serializedParamValue.substring(1));
    }
    case 'matrix': {
      return decodeURIComponent(serializedParamValue.substring(1).split('=')[1]);
    }
  }
}

/**
 * Deserialize path parameters of type array
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param serializedParamValue serialized path parameter value
 * @param paramSerialization parameter serialization
 */
function deserializeArrayPathParams(serializedParamValue: string, paramSerialization: ParamSerialization) {
  return splitParamElements(serializedParamValue, paramSerialization);
}

/**
 * Deserialize path parameters of type object
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param serializedParamValue serialized path parameter value
 * @param paramSerialization parameter serialization
 */
function deserializeObjectPathParams(serializedParamValue: string, paramSerialization: ParamSerialization) {
  // NOTE: The splitParamElements function is called since object path parameters can be split by delimiters based on the serialization style
  // NOTE: There is an exception for path parameters of exploded style 'matrix' which is not serialized like its corresponding array
  // This exception is serialized like this (prefixed by a ';'): ';prop1=value1;prop2=value2'
  const splitObject: string[] = paramSerialization.style === 'matrix' && paramSerialization.explode
    ? serializedParamValue.substring(1).split(';').map((value) => decodeURIComponent(value))
    : splitParamElements(serializedParamValue, paramSerialization)!;

  // NOTE: Object path parameters that are exploded are serialized as 'prop=value'
  if (paramSerialization.explode) {
    return splitObject.reduce((obj: { [key: string]: PrimitiveType }, serializedProperty) => {
      const [key, value] = serializedProperty.split('=').map((v) => decodeURIComponent(v));
      obj[key] = value;
      return obj;
    }, {} as { [key: string]: PrimitiveType });
  }

  return objectFromPairwiseArray(splitObject);
}

/**
 * Deserialize path parameters based on the values of exploded and style and the parameter type
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param serializedPathParams serialized path parameters
 * @param pathParamSerialization path parameter serialization
 */
export function deserializePathParams<T extends { [key: string]: string }>(
  serializedPathParams: T,
  pathParamSerialization: { [p in keyof T]: ParamSerialization & { paramType: ParamTypeForDeserialization } }
): { [p in keyof T]: SupportedParamType } {
  return Object.entries(serializedPathParams).reduce((acc, [pathParamName, serializedParamValue]) => {
    const paramSerialization = pathParamSerialization[pathParamName];
    let deserializedValue: SupportedParamType;
    if (paramSerialization.paramType === 'array') {
      deserializedValue = deserializeArrayPathParams(serializedParamValue, paramSerialization);
    } else if (paramSerialization.paramType === 'object') {
      deserializedValue = deserializeObjectPathParams(serializedParamValue, paramSerialization);
    } else {
      deserializedValue = deserializePrimitivePathParams(serializedParamValue, paramSerialization);
    }
    if (deserializedValue) {
      acc[pathParamName] = deserializedValue;
    } else {
      throw new Error(`Unable to deserialize path parameter ${pathParamName} since the combination explode=${paramSerialization.explode} and style='${paramSerialization.style}' is not supported.`);
    }
    return acc;
  }, {} as Record<string, SupportedParamType>) as { [p in keyof T]: SupportedParamType };
}
