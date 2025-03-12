import {
  utils,
} from './date';

/** OpenAPI parameter serialization syntax */
export interface ParamSerialization {
  /** Parameter is of exploded syntax */
  explode: boolean;
  /** Style of the parameter */
  style: string;
}

/** Primitive types for the operation parameters */
export type PrimitiveType = string | number | boolean | Date | utils.Date | utils.DateTime | undefined | null;
/** Supported types for the operation parameters - primitives, primitive arrays, and simple non-nested objects */
export type SupportedParamType = PrimitiveType | PrimitiveType[] | { [key: string]: PrimitiveType };

/**
 * Verify if property is of type utils.Date or utils.DateTime
 * @param prop
 */
export function isDateType(prop: any): prop is Date | utils.Date | utils.DateTime {
  return prop instanceof Date || prop instanceof utils.Date || prop instanceof utils.DateTime;
}

/**
 * Serialize query parameters of type array
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param queryParamName
 * @param queryParamValue
 * @param paramSerialization
 */
function serializeArrayQueryParams(queryParamName: string, queryParamValue: PrimitiveType[], paramSerialization: ParamSerialization) {
  const filteredArray = queryParamValue.filter((v) => typeof v !== 'undefined' && v !== null);
  const emptyArray = filteredArray.length === 0;
  if (paramSerialization.explode && paramSerialization.style === 'form') {
    return emptyArray
      ? encodeURIComponent(queryParamName) + '='
      : filteredArray.map((v) => encodeURIComponent(queryParamName) + '=' + (isDateType(v) ? v.toJSON() : encodeURIComponent(v.toString()))).join('&');
  } else if (!paramSerialization.explode) {
    switch (paramSerialization.style) {
      case 'form': {
        return encodeURIComponent(queryParamName) + '=' + (emptyArray ? '' : filteredArray.map((v) => isDateType(v) ? v.toJSON() : encodeURIComponent(v.toString())).join(','));
      }
      case 'spaceDelimited': {
        if (emptyArray) {
          break;
        }
        return encodeURIComponent(queryParamName) + '=' + filteredArray.map((v) => isDateType(v) ? v.toJSON() : encodeURIComponent(v.toString())).join('%20');
      }
      case 'pipeDelimited': {
        if (emptyArray) {
          break;
        }
        return encodeURIComponent(queryParamName) + '=' + filteredArray.map((v) => isDateType(v) ? v.toJSON() : encodeURIComponent(v.toString())).join('%7C');
      }
    }
  }
  return undefined;
}

/**
 * Serialize query parameters of type object
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param queryParamName
 * @param queryParamValue
 * @param paramSerialization
 */
function serializeObjectQueryParams(queryParamName: string, queryParamValue: { [key: string]: PrimitiveType }, paramSerialization: ParamSerialization) {
  const filteredObject = Object.fromEntries(
    Object.entries(queryParamValue).filter((property): property is [string, string | boolean | number] => typeof property[1] !== 'undefined' && property[1] !== null)
  );
  const emptyObject = Object.keys(filteredObject).length === 0;
  if (paramSerialization.style === 'form') {
    if (emptyObject) {
      return encodeURIComponent(queryParamName) + '=';
    }
    return paramSerialization.explode
      ? Object.entries(filteredObject).map(([propName, propValue]) => encodeURIComponent(propName) + '=' + encodeURIComponent(propValue.toString())).join('&')
      : encodeURIComponent(queryParamName) + '=' + Object.entries(filteredObject).map(([propName, propValue]) =>
        encodeURIComponent(propName) + ',' + (isDateType(propValue) ? propValue.toJSON() : encodeURIComponent(propValue.toString()))).join(',');
  } else if (paramSerialization.style === 'spaceDelimited' && !paramSerialization.explode && !emptyObject) {
    return encodeURIComponent(queryParamName) + '=' + Object.entries(filteredObject).map(([propName, propValue]) =>
      encodeURIComponent(propName) + '%20' + (isDateType(propValue) ? propValue.toJSON() : encodeURIComponent(propValue.toString()))
    ).join('%20');
  } else if (paramSerialization.style === 'pipeDelimited' && !paramSerialization.explode && !emptyObject) {
    return encodeURIComponent(queryParamName) + '=' + Object.entries(filteredObject).map(([propName, propValue]) =>
      encodeURIComponent(propName) + '%7C' + (isDateType(propValue) ? propValue.toJSON() : encodeURIComponent(propValue.toString()))
    ).join('%7C');
  } else if (paramSerialization.style === 'deepObject' && paramSerialization.explode && !emptyObject) {
    return Object.entries(filteredObject).map(([propName, propValue]) =>
      encodeURIComponent(queryParamName) + '%5B' + encodeURIComponent(propName) + '%5D=' + (isDateType(propValue) ? propValue.toJSON() : encodeURIComponent(propValue.toString()))
    ).join('&');
  }
}

/**
 * Serialize query parameters based on the values of exploded and style
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param queryParams
 * @param queryParamSerialization
 */
export function serializeQueryParams<T extends { [key: string]: SupportedParamType }>(queryParams: T, queryParamSerialization: { [p in keyof T]: ParamSerialization }): { [p in keyof T]: string } {
  return Object.entries(queryParamSerialization).reduce((acc, [queryParamName, paramSerialization]) => {
    const queryParamValue = queryParams[queryParamName];
    if (typeof queryParamValue !== 'undefined' && queryParamValue !== null && !!paramSerialization) {
      let serializedValue: string | undefined;
      if (Array.isArray(queryParamValue)) {
        serializedValue = serializeArrayQueryParams(queryParamName, queryParamValue, paramSerialization);
      } else if (typeof queryParamValue === 'object' && !isDateType(queryParamValue)) {
        serializedValue = serializeObjectQueryParams(queryParamName, queryParamValue, paramSerialization);
      } else {
        if (paramSerialization.style === 'form') {
          serializedValue = encodeURIComponent(queryParamName) + '=' + (isDateType(queryParamValue) ? queryParamValue.toJSON() : encodeURIComponent(queryParamValue.toString()));
        }
      }
      if (serializedValue) {
        acc[queryParamName as keyof T] = serializedValue;
      }
    }
    return acc;
  }, {} as { [p in keyof T]: string });
}

/**
 * Serialize path parameters of type array
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param pathParamName
 * @param pathParamValue
 * @param paramSerialization
 */
function serializeArrayPathParams(pathParamName: string, pathParamValue: PrimitiveType[], paramSerialization: ParamSerialization) {
  const filteredArray = pathParamValue.filter((v) => typeof v !== 'undefined' && v !== null);
  const emptyArray = filteredArray.length === 0;
  switch (paramSerialization.style) {
    case 'simple': {
      if (emptyArray) {
        break;
      }
      return filteredArray.map((v) => isDateType(v) ? v.toJSON() : encodeURIComponent(v.toString())).join(',');
    }
    case 'label': {
      return '.' + (emptyArray ? '' : filteredArray.map((v) => isDateType(v) ? v.toJSON() : encodeURIComponent(v.toString())).join(paramSerialization.explode ? '.' : ','));
    }
    case 'matrix': {
      return paramSerialization.explode
        ? ';' + (emptyArray
          ? encodeURIComponent(pathParamName)
          : filteredArray.map((v) => encodeURIComponent(pathParamName) + '=' + (isDateType(v) ? v.toJSON() : encodeURIComponent(v.toString()))).join(';'))
        : ';' + encodeURIComponent(pathParamName) + (emptyArray ? '' : '=' + filteredArray.map((v) => isDateType(v) ? v.toJSON() : encodeURIComponent(v.toString())).join(','));
    }
  }
}

/**
 * Serialize path parameters of type object
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param pathParamName
 * @param pathParamValue
 * @param paramSerialization
 */
function serializeObjectPathParams(pathParamName: string, pathParamValue: { [key: string]: PrimitiveType }, paramSerialization: ParamSerialization) {
  const filteredObject = Object.fromEntries(
    Object.entries(pathParamValue).filter((property): property is [string, string | number | boolean | utils.Date | utils.DateTime] => typeof property[1] !== 'undefined' && property[1] !== null)
  );
  const emptyObject = Object.keys(filteredObject).length === 0;
  switch (paramSerialization.style) {
    case 'simple': {
      if (emptyObject) {
        break;
      }
      return paramSerialization.explode
        ? Object.entries(filteredObject).map(([propName, propValue]) =>
          encodeURIComponent(propName) + '=' + (isDateType(propValue) ? propValue.toJSON() : encodeURIComponent(propValue.toString()))).join(',')
        : Object.entries(filteredObject).map(([propName, propValue]) =>
          encodeURIComponent(propName) + ',' + (isDateType(propValue) ? propValue.toJSON() : encodeURIComponent(propValue.toString()))).join(',');
    }
    case 'label': {
      if (emptyObject) {
        return '.';
      }
      return paramSerialization.explode
        ? '.' + Object.entries(filteredObject).map(([propName, propValue]) =>
          encodeURIComponent(propName) + '=' + (isDateType(propValue) ? propValue.toJSON() : encodeURIComponent(propValue.toString()))).join('.')
        : '.' + Object.entries(filteredObject).map(([propName, propValue]) =>
          encodeURIComponent(propName) + ',' + (isDateType(propValue) ? propValue.toJSON() : encodeURIComponent(propValue.toString()))).join(',');
    }
    case 'matrix': {
      if (emptyObject) {
        return ';' + encodeURIComponent(pathParamName);
      }
      return paramSerialization.explode
        ? ';' + Object.entries(filteredObject).map(([propName, propValue]) =>
          encodeURIComponent(propName) + '=' + (isDateType(propValue) ? propValue.toJSON() : encodeURIComponent(propValue.toString()))).join(';')
        : ';' + encodeURIComponent(pathParamName) + '=' + Object.entries(filteredObject).map(([propName, propValue]) =>
          encodeURIComponent(propName) + ',' + (isDateType(propValue) ? propValue.toJSON() : encodeURIComponent(propValue.toString()))).join(',');
    }
  }
}

/**
 * Serialize path parameters of type primitive
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param pathParamName
 * @param pathParamValue
 * @param paramSerialization
 */
function serializePrimitivePathParams(pathParamName: string, pathParamValue: PrimitiveType, paramSerialization: ParamSerialization) {
  if (typeof pathParamValue !== 'undefined' && pathParamValue !== null && !!paramSerialization) {
    switch (paramSerialization.style) {
      case 'simple': {
        return isDateType(pathParamValue) ? pathParamValue.toJSON() : encodeURIComponent(pathParamValue);
      }
      case 'label': {
        return '.' + (isDateType(pathParamValue) ? pathParamValue.toJSON() : encodeURIComponent(pathParamValue));
      }
      case 'matrix': {
        return ';' + encodeURIComponent(pathParamName) + '=' + (isDateType(pathParamValue) ? pathParamValue.toJSON() : encodeURIComponent(pathParamValue));
      }
    }
  }
}

/**
 * Serialize path parameters based on the values of exploded and style, which prepares the path parameters for the URL to be called
 * OpenAPI Parameter Serialization {@link https://swagger.io/specification | documentation}
 * @param pathParams
 * @param pathParamSerialization key value pair with the parameters. If the value is undefined, the key is dropped
 */
export function serializePathParams<T extends { [key: string]: SupportedParamType }>(pathParams: T, pathParamSerialization: { [p in keyof T]: ParamSerialization }): { [p in keyof T]: string } {
  return Object.entries(pathParamSerialization).reduce((acc, [pathParamName, paramSerialization]) => {
    const pathParamValue = pathParams[pathParamName];
    if (typeof pathParamValue !== 'undefined' && pathParamValue !== null) {
      let serializedValue: string | undefined;
      if (Array.isArray(pathParamValue)) {
        serializedValue = serializeArrayPathParams(pathParamName, pathParamValue, paramSerialization);
      } else if (typeof pathParamValue === 'object' && !isDateType(pathParamValue)) {
        serializedValue = serializeObjectPathParams(pathParamName, pathParamValue, paramSerialization);
      } else {
        serializedValue = serializePrimitivePathParams(pathParamName, pathParamValue, paramSerialization);
      }
      if (serializedValue) {
        acc[pathParamName as keyof T] = serializedValue;
      }
    }
    return acc;
  }, {} as { [p in keyof T]: string });
}
