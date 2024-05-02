import {TokenizedOptions} from '../plugins/core/request-plugin';
import type {ReviverType} from './Reviver';

/**
 * prepares the url to be called
 * @param url base url to be used
 * @param queryParameters key value pair with the parameters. If the value is undefined, the key is dropped
 */
export function prepareUrl(url: string, queryParameters: { [key: string]: string | undefined } = {}) {
  const queryPart = Object.keys(queryParameters)
    .filter((name) => typeof queryParameters[name] !== 'undefined')
    .map((name) => `${name}=${queryParameters[name]!}`)
    .join('&');

  const paramsPrefix = url.indexOf('?') > -1 ? '&' : '?';

  return url + (!queryPart ? '' : paramsPrefix + queryPart);
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
      acc[name] = (typeof prop.toJSON === 'function') ? prop.toJSON() : prop.toString();
      return acc;
    }, {} as { [p in keyof T]: string });
}

/**
 * Returns a filtered json object, removing all the undefined vlaues
 * @param object JSON object to filter
 * @returns an object without undefined values
 */
export function filterUndefinedValues(object: { [key: string]: string | undefined }): { [key: string]: string } {
  return Object.keys(object)
    .filter((objectKey) => typeof object[objectKey] !== 'undefined')
    .reduce<{ [key: string]: string }>((acc, objectKey) => {
      acc[objectKey] = object[objectKey] as string;
      return acc;
    }, {});
}

/**
 * Receives an object containing key/value pairs
 * Encodes this object to match application/x-www-urlencoded or multipart/form-data
 * @param data
 * @param type
 * @param data
 * @param type
 */
export function processFormData(data: any, type: string): FormData | string {

  let encodedData: FormData | string;

  /* eslint-disable guard-for-in */
  if (type === 'multipart/form-data') {
    const formData: FormData = new FormData();
    for (const i in data) {
      formData.append(i, data[i]);
    }
    encodedData = formData;
  } else {
    const formData: string[] = [];
    for (const i in data) {
      formData.push(`${i}=${encodeURIComponent(data[i])}`);
    }
    encodedData = formData.join('&');
  }
  /* eslint-enable guard-for-in */

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
  const tokenizedQueryParams = {...queryParameters};
  Object.entries(piiParamTokens).filter(([parameterName, _token]) => data[parameterName] !== undefined).forEach(([parameterName, token]) => {
    if (tokenizedQueryParams[parameterName]) {
      tokenizedQueryParams[parameterName] = token;
    }
    values[token] = data[parameterName];
  });

  return {values, url: tokenizedUrl, queryParams: tokenizedQueryParams};
}

/**
 * Compute the reviver to use in case the success response code returned by the API does not match the API
 * Fallback to the lowest status code's reviver.
 * Does not try to match non-successful responses as error are handled separately
 * @param revivers
 * @param endpoint
 * @param response
 * @param options
 * @param options.disableFallback
 * @param options.log
 */
export function getResponseReviver<T>(revivers: { [statusCode: number]: ReviverType<T> | undefined } | undefined | ReviverType<T>, response: Pick<Response, 'ok' | 'status'> | undefined,
  // eslint-disable-next-line no-console
  endpoint?: string | undefined, options: { disableFallback?: boolean; log?: (...args: any[]) => void } = {disableFallback: false, log: console.error}): ReviverType<T> | undefined {
  const logPrefix = `API status code error for ${endpoint || 'unknown'} endpoint`;
  const logMsg = options.log || (() => {});
  if (!response || !response.ok) {
    return undefined;
  }
  if (typeof revivers === 'function' || typeof revivers === 'undefined') {
    return revivers;
  }
  if (response.status && revivers[response.status]) {
    return revivers[response.status];
  }
  if (options?.disableFallback) {
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
  }, {statusCode: Number.MAX_SAFE_INTEGER, reviver: undefined});
  const fallbackLog = Number.MAX_SAFE_INTEGER !== fallback.statusCode ? `Fallback to ${fallback.statusCode}'s reviver` : 'No fallback found';
  logMsg(`${logPrefix} - Unknown ${response.status || 'undefined'} code returned by the API - ${fallbackLog}`);
  return fallback.reviver;
}
