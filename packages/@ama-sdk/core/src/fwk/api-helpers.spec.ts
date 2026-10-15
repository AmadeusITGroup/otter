/* eslint-disable no-console -- only using the reference */
import {
  getResponseReviver,
  prepareUrlWithQueryParams,
  ReviverType,
  stringifyQueryParams,
} from '@ama-sdk/core';

describe('getResponseReviver - revivers by status code', () => {
  const revivers: { [key: number]: ReviverType<any> | undefined } = {
    202: jest.fn(),
    201: jest.fn()
  };

  beforeEach(() => {
    jest.spyOn(console, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not return a reviver for a non ok response', () => {
    expect(getResponseReviver(revivers, { status: 300, ok: false })).toBe(undefined);
  });

  it('should return a reason but not reviver for a 204 No Content Response', () => {
    expect(getResponseReviver(revivers, { status: 204, ok: true })).toBe(undefined);
    expect(console.error).toHaveBeenCalledWith('API status code error for unknown endpoint - 204 response is not defined in the API specification');
  });

  it('should return the status code\'s reviver', () => {
    expect(getResponseReviver(revivers, { status: 202, ok: true }, 'myEndpoint')).toBe(revivers[202]);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should fallback on the first defined status if the status code\'s reviver is not defined', () => {
    expect(getResponseReviver(revivers, { status: undefined, ok: true }, 'myEndpoint')).toBe(revivers[201]);
    expect(console.error).toHaveBeenCalledWith('API status code error for myEndpoint endpoint - Unknown undefined code returned by the API - Fallback to 201\'s reviver');
  });

  it('should not fallback on 204 (No Content)\'s reviver', () => {
    const reviversWith204 = { 204: jest.fn(), 206: jest.fn() };
    const fallback = getResponseReviver(reviversWith204, { status: 201, ok: true }, 'myEndpoint');
    expect(fallback).toBe(reviversWith204[206]);
    expect(fallback).not.toBe(reviversWith204[204]);
    expect(console.error).toHaveBeenCalledWith('API status code error for myEndpoint endpoint - Unknown 201 code returned by the API - Fallback to 206\'s reviver');
  });

  it('should not fallback if the feature is deactivated', () => {
    jest.spyOn(console, 'log');
    expect(getResponseReviver(revivers, { status: 206, ok: true }, 'myEndpoint', { disableFallback: true, log: console.log })).toBe(undefined);
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('API status code error for myEndpoint endpoint - Missing 206 from API specification - fallback is deactivated, no revive will run on this response');
  });
});

describe('getResponseReviver - reviver as function', () => {
  const reviver = jest.fn();

  it('should not return a reviver for a non ok response', () => {
    expect(getResponseReviver(reviver, { status: 300, ok: false })).toBe(undefined);
  });

  it('should only return the reviver if the endpoint reviver is a function or an undefined object', () => {
    expect(getResponseReviver(reviver, { status: 200, ok: true })).toBe(reviver);
    expect(getResponseReviver(undefined, { status: 200, ok: true })).toBe(undefined);
  });
});

describe('Prepare URL', () => {
  it('should correctly prepare url with serialized query parameters', () => {
    // one parameter
    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath/sampleOperation', { id: 'id=5' }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=5');

    // no parameters
    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath/sampleOperation', {})).toEqual('https://sampleUrl/samplePath/sampleOperation');

    // multiple parameters
    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath/sampleOperation', { id1: 'id1=3,4,5', id2: 'id2=5' }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id1=3,4,5&id2=5');
  });

  it('should correctly prepare url with serialized query parameters when enableParameterSerialization is true', () => {
    // Serialized values already contain "key=value" — Object.values is used
    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath/sampleOperation', { id: 'id=5' }, true))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=5');

    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath/sampleOperation', { id1: 'id1=3,4,5', id2: 'id2=5' }, true))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id1=3,4,5&id2=5');
  });

  it('should correctly prepare url with stringified query parameters when enableParameterSerialization is false', () => {
    // Stringified values are bare — Object.entries is used to produce "key=value"
    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath/sampleOperation', { id: '5' }, false))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=5');

    // no parameters
    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath/sampleOperation', {}, false))
      .toEqual('https://sampleUrl/samplePath/sampleOperation');

    // multiple parameters
    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath/sampleOperation', { id1: '3,4,5', id2: '5' }, false))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id1=3,4,5&id2=5');

    // array-like values
    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath/sampleOperation', { tags: 'a,b,c' }, false))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?tags=a,b,c');

    // undefined values should be filtered
    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath/sampleOperation', { id: '5', filter: undefined }, false))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=5');
  });

  it('should use & as separator when url already contains ?', () => {
    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath?existing=1', { id: 'id=5' }, true))
      .toEqual('https://sampleUrl/samplePath?existing=1&id=5');

    expect(prepareUrlWithQueryParams('https://sampleUrl/samplePath?existing=1', { id: '5' }, false))
      .toEqual('https://sampleUrl/samplePath?existing=1&id=5');
  });
});

describe('stringifyQueryParams', () => {
  it('should exclude undefined values from the result', () => {
    const queryParams = { id: '5', filter: undefined, name: 'test' };
    const result = stringifyQueryParams(queryParams);
    expect(result).toEqual({ id: '5', name: 'test' });
    expect('filter' in result).toBe(false);
  });

  it('should exclude null values from the result', () => {
    const queryParams = { id: '5', filter: null, name: 'test' };
    const result = stringifyQueryParams(queryParams);
    expect(result).toEqual({ id: '5', name: 'test' });
    expect('filter' in result).toBe(false);
  });

  it('should produce correct URL when combined with prepareUrlWithQueryParams and enableParameterSerialization is false', () => {
    // Simulates the template flow: stringifyQueryParams -> prepareUrlWithQueryParams(url, params, false)
    const queryParams = { id: '5', filter: undefined, page: '2' };
    const stringified = stringifyQueryParams(queryParams);
    const url = prepareUrlWithQueryParams('https://api.example.com/resource', stringified, false);
    expect(url).toEqual('https://api.example.com/resource?id=5&page=2');
  });
});
