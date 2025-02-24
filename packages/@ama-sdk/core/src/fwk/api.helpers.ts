import {
  TokenizedOptions,
} from '../plugins/core/request-plugin';
import type {
  SupportedParamType,
} from './param-serialization';
import type {
  ReviverType,
} from './reviver';

/**
 * Prepares the url to be called
 * @param url Base url to be used
 * @param queryParameters Key value pair with the parameters. If the value is undefined, the key is dropped
 * @deprecated use {@link prepareUrlWithQueryParams} with query parameter serialization, will be removed in v14.
 */
export function prepareUrl(url: string, queryParameters: { [key: string]: string | undefined } = {}) {
  const queryPart = Object.keys(queryParameters)
    .filter((name) => typeof queryParameters[name] !== 'undefined')
    .map((name) => `${name}=${queryParameters[name]!}`)
    .join('&');

  const paramsPrefix = url.includes('?') ? '&' : '?';

  return url + (queryPart ? paramsPrefix + queryPart : '');
}

/**
 * Prepares the url to be called with the query parameters
 * @param url Base url to be used
 * @param serializedQueryParams Key value pairs of query parameter names and their serialized values
 */
export function prepareUrlWithQueryParams(url: string, serializedQueryParams: { [key: string]: string }): string {
  const paramsPrefix = url.includes('?') ? '&' : '?';
  const queryPart = Object.values(serializedQueryParams).join('&');
  return url + (queryPart ? paramsPrefix + queryPart : '');
}

/**
 * Returns a map containing the query parameters
 * @param data
 * @param names
 * @deprecated use {@link stringifyQueryParams} which accepts only supported types, will be removed in v14.
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
 * Get requested properties from data
 * @param data Data to get properties from
 * @param keys Keys of properties to retrieve
 */
export function getPropertiesFromData<T, K extends keyof T>(data: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, key) => {
    acc[key] = data[key];
    return acc;
  }, {} as Pick<T, K>);
}

/**
 * Stringifies the values of the query parameters
 * @param queryParams Query parameters of supported parameter types
 */
export function stringifyQueryParams<T extends { [key: string]: SupportedParamType }>(queryParams: T): { [p in keyof T]: string; } {
  const names = Object.keys(queryParams) as (keyof T)[];
  return names
    .filter((name) => typeof queryParams[name] !== 'undefined' && queryParams[name] !== null)
    .reduce((acc, name) => {
      const prop = queryParams[name];
      acc[name] = (typeof prop === 'object' && !Array.isArray(prop)) ? JSON.stringify(prop) : prop!.toString();
      return acc;
    }, {} as { [p in keyof T]: string });
}

/**
 * Returns a filtered json object, removing all the undefined values
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
