/* eslint-disable no-console -- only using the reference */
import {
  getResponseReviver,
  ReviverType
} from '@ama-sdk/core';

describe('getResponseReviver - revivers by status code', () => {
  const revivers: { [key: number]: ReviverType<any> | undefined } = {
    202: jest.fn(),
    201: jest.fn()
  } as any;

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
