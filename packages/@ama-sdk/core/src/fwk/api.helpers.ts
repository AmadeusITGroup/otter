import {
  TokenizedOptions,
} from '../plugins/core/request-plugin';
import type {
  ReviverType,
} from './reviver';

/** OpenAPI parameter serialization syntax */
export interface ParamSerialization {
  /** Parameter is of exploded syntax */
  explode: boolean;
  /** Style of the parameter */
  style: string;
}

/**
 * Serialize query parameters based on the values of exploded and style
 * @param data
 * @param queryParamSerialization
 */
export function serializeQueryParams<T extends { [key: string]: any }>(data: T, queryParamSerialization: { [p in keyof T]?: ParamSerialization }) {
  return Object.entries(queryParamSerialization)
    .reduce((acc, [name, paramSerialization]) => {
      const queryParamValue = data[name];
      if (typeof queryParamValue !== 'undefined' && queryParamValue !== null && !!paramSerialization) {
        const queryParamExplode = paramSerialization.explode;
        const queryParamStyle = paramSerialization.style;
        const value = (() => {
          if (Array.isArray(queryParamValue)) {
            if (queryParamExplode) {
              switch (queryParamStyle) {
                case 'form':
                case 'spaceDelimited':
                case 'pipeDelimited': {
                  return queryParamValue.map((v) => `${name}=${v}`).join('&');
                }
              }
            } else {
              switch (queryParamStyle) {
                case 'form': {
                  return `${name}=${queryParamValue.toString()}`;
                }
                case 'spaceDelimited': {
                  return `${name}=${queryParamValue.join('%20')}`;
                }
                case 'pipeDelimited': {
                  return `${name}=${queryParamValue.join('|')}`;
                }
              }
            }
          } else if (typeof queryParamValue === 'object') {
            if (queryParamStyle === 'form') {
              return queryParamExplode
                ? Object.keys(queryParamValue).map((prop) => `${prop}=${queryParamValue[prop]}`).join('&')
                : `${name}=` + Object.keys(queryParamValue).map((prop) => `${prop},${queryParamValue[prop]}`).join(',');
            } else {
              return Object.keys(queryParamValue).map((prop) => `${name}[${prop}]=${queryParamValue[prop]}`).join('&');
            }
          } else {
            return `${name}=${queryParamValue}`;
          }
        })();
        acc[name as keyof T] = value as string;
      }
      return acc;
    }, {} as { [p in keyof T]: string });
}

/**
 * Prepares the path parameters for the URL to be called
 * @param data
 * @param pathParameters key value pair with the parameters. If the value is undefined, the key is dropped
 */
export function serializePathParams<T extends { [key: string]: any }>(data: T, pathParameters: { [K in keyof T]?: ParamSerialization } = {}): { [p in keyof T]: string } {
  return Object.entries(pathParameters)
    .reduce((acc, [pathParamName, pathParamSerialization]) => {
      const pathParamValue = data[pathParamName];
      if (typeof pathParamValue !== 'undefined' && pathParamValue !== null && !!pathParamSerialization) {
        const value = (() => {
          if (Array.isArray(pathParamValue)) {
            switch (pathParamSerialization.style) {
              case 'simple': {
                return `${pathParamValue.join(',')}`;
              }
              case 'label': {
                return `.${pathParamValue.join(pathParamSerialization.explode ? '.' : ',')}`;
              }
              case 'matrix': {
                return pathParamSerialization.explode
                  ? `;${pathParamValue.map((v) => `${pathParamName}=${v}`).join(';')}`
                  : `;${pathParamName}=${pathParamValue.join(',')}`;
              }
            }
          } else if (typeof pathParamValue === 'object') {
            switch (pathParamSerialization.style) {
              case 'simple': {
                return pathParamSerialization.explode
                  ? Object.keys(pathParamValue).map((property) => `${property}=${pathParamValue[property]}`).join(',')
                  : Object.keys(pathParamValue).map((property) => `${property},${pathParamValue[property]}`).join(',');
              }
              case 'label': {
                return pathParamSerialization.explode
                  ? '.' + Object.keys(pathParamValue).map((property) => `${property}=${pathParamValue[property]}`).join('.')
                  : '.' + Object.keys(pathParamValue).map((property) => `${property},${pathParamValue[property]}`).join(',');
              }
              case 'matrix': {
                return pathParamSerialization.explode
                  ? ';' + Object.keys(pathParamValue).map((property) => `${property}=${pathParamValue[property]}`).join(';')
                  : `;${pathParamName}=` + Object.keys(pathParamValue).map((property) => `${property},${pathParamValue[property]}`).join(',');
              }
            }
          } else {
            switch (pathParamSerialization.style) {
              case 'simple': {
                return `${pathParamValue}`;
              }
              case 'label': {
                return `.${pathParamValue}`;
              }
              case 'matrix': {
                return `;${pathParamName}=${pathParamValue}`;
              }
            }
          }
        })();
        acc[pathParamName as keyof T] = value as string;
      }
      return acc;
    }, {} as { [p in keyof T]: string });
}

/**
 * Prepares the url to be called
 * @param url base url to be used
 * @param data Query parameters key value pair. If the value is undefined, the key is dropped.
 * @deprecated use `prepareUrl` with query parameter serialization, will be removed in v14.
 */
export function prepareUrl(url: string, data: { [key: string]: string | undefined }): string;
/**
 * Prepares the url to be called
 * @param url base url to be used
 * @param data Data to prepare the query parameters in the URL
 * @param queryParamSerialization Query parameter serialization, defined by `explode` and `style`
 */
export function prepareUrl<T extends { [key: string]: any }>(url: string, data: T, queryParamSerialization: { [K in keyof T]?: ParamSerialization }): string;
/**
 * Prepares the url to be called
 * @param url base url to be used
 * @param data Data to prepare the query parameters in the URL
 * @param queryParamSerialization Query parameter serialization, defined by `explode` and `style`
 */
export function prepareUrl<T extends { [key: string]: any }>(
  url: string,
  data: { [key: string]: string | undefined } | T,
  queryParamSerialization?: { [K in keyof T]?: ParamSerialization }
) {
  const paramsPrefix = url.includes('?') ? '&' : '?';
  if (queryParamSerialization) {
    if (Object.keys(queryParamSerialization).length > 0) {
      const serializedQueryParams = serializeQueryParams(data as T, queryParamSerialization);
      return url + paramsPrefix + Object.values(serializedQueryParams).join('&');
    }
    return url;
  }

  const queryPart = Object.keys(data)
    .filter((name) => typeof data[name] !== 'undefined')
    .map((name) => `${name}=${data[name]!}`)
    .join('&');
  return url + (queryPart ? paramsPrefix + queryPart : '');
}

/**
 * Returns a map containing the query parameters
 * @param data
 * @param names
 */
export function extractQueryParams<T extends { [key: string]: any }>(data: T, names: (keyof T)[]): { [p in keyof T]: string; } {
  return names
    .filter((name) => typeof data[name] !== 'undefined' && data[name] !== null)
    .reduce((acc, name) => {
      const prop = data[name];
      acc[name] = (typeof prop.toJSON === 'function')
        ? prop.toJSON()
        : ((typeof prop === 'object' && !Array.isArray(prop)) ? JSON.stringify(prop) : prop.toString());
      return acc;
    }, {} as { [p in keyof T]: string });
}

/**
 * Returns a filtered json object, removing all the undefined vlaues
 * @param object JSON object to filter
 * @returns an object without undefined values
 */
export function filterUndefinedValues(object?: { [key: string]: string | undefined }): { [key: string]: string } {
  return object
    ? Object.keys(object)
      .filter((objectKey) => typeof object[objectKey] !== 'undefined')
      .reduce<{ [key: string]: string }>((acc, objectKey) => {
        acc[objectKey] = object[objectKey] as string;
        return acc;
      }, {})
    : {};
}

/**
 * Receives an object containing key/value pairs
 * Encodes this object to match application/x-www-urlencoded or multipart/form-data
 * @param data
 * @param type
 */
export function processFormData(data: any, type: string): FormData | string {
  let encodedData: FormData | string;

  if (type === 'multipart/form-data') {
    const formData: FormData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value as any));
    encodedData = formData;
  } else {
    encodedData = Object.entries(data).map(([key, value]) => `${key}=${encodeURIComponent(value as any)}`).join('&');
  }

  return encodedData;
}

/**
 * Computes tokens based on the given list of PII parameter names.
 * @param piiParameterNames The list of PII parameter names to compute tokens from
 * @returns the association between parameter names and their corresponding tokens
 */
export function computePiiParameterTokens(piiParameterNames: string[]): { [key: string]: string } {
  return piiParameterNames.reduce<Record<string, string>>((tokens, parameterName) => {
    tokens[parameterName] = `$${parameterName}$`;
    return tokens;
  }, {});
}

/**
 * Returns tokenized request options:
 * URL/query parameters for which sensitive parameters are replaced by tokens and the corresponding token-value associations
 * @param tokenizedUrl URL for which parameters containing PII have been replaced by tokens
 * @param queryParameters Original query parameters
 * @param piiParamTokens Tokens of the parameters containing PII
 * @param data Data to provide to the API call
 * @returns the tokenized request options
 */
export function tokenizeRequestOptions(tokenizedUrl: string, queryParameters: { [key: string]: string }, piiParamTokens: { [key: string]: string }, data: any): TokenizedOptions {
  const values: Record<string, string> = {};
  const tokenizedQueryParams = { ...queryParameters };
  Object.entries(piiParamTokens).filter(([parameterName, _token]) => data[parameterName] !== undefined).forEach(([parameterName, token]) => {
    if (tokenizedQueryParams[parameterName]) {
      tokenizedQueryParams[parameterName] = token;
    }
    values[token] = data[parameterName];
  });

  return { values, url: tokenizedUrl, queryParams: tokenizedQueryParams };
}

/**
 * Compute the reviver to use in case the success response code returned by the API does not match the API
 * Fallback to the lowest status code's reviver.
 * Does not try to match non-successful responses as error are handled separately
 * @param revivers
 * @param response
 * @param endpoint
 * @param options `{ disableFallback: false, log: console.error }` by default
 * @param options.disableFallback `false` by default
 * @param options.log `console.error` by default
 */
export function getResponseReviver<T>(
  revivers: { [statusCode: number]: ReviverType<T> | undefined } | undefined | ReviverType<T>,
  response: Pick<Response, 'ok' | 'status'> | undefined,
  endpoint?: string,
  options?: { disableFallback?: boolean; log?: (...args: any[]) => void }
): ReviverType<T> | undefined {
  // eslint-disable-next-line no-console -- set as default value
  const { disableFallback = false, log: logMsg = console.error } = options ?? {};
  const logPrefix = `API status code error for ${endpoint || 'unknown'} endpoint`;
  if (!response || !response.ok) {
    return undefined;
  }
  if (typeof revivers === 'function' || typeof revivers === 'undefined') {
    return revivers;
  }
  if (response.status && Object.keys(revivers).includes(`${response.status}`)) {
    return revivers[response.status];
  }
  if (disableFallback) {
    logMsg(`${logPrefix} - Missing ${response.status} from API specification - fallback is deactivated, no revive will run on this response`);
    return undefined;
  }
  if (response.status === 204) {
    logMsg(`${logPrefix} - 204 response is not defined in the API specification`);
    return undefined;
  }
  const fallback = Object.entries(revivers).reduce((acc: { statusCode: number; reviver: ReviverType<T> | undefined }, [statusCode, reviver]) => {
    const code = +statusCode;
    if (code < acc.statusCode && code !== 204) {
      acc.statusCode = code;
      acc.reviver = reviver;
    }
    return acc;
  }, { statusCode: Number.MAX_SAFE_INTEGER, reviver: undefined });
  const fallbackLog = Number.MAX_SAFE_INTEGER === fallback.statusCode ? 'No fallback found' : `Fallback to ${fallback.statusCode}'s reviver`;
  logMsg(`${logPrefix} - Unknown ${response.status || 'undefined'} code returned by the API - ${fallbackLog}`);
  return fallback.reviver;
}
