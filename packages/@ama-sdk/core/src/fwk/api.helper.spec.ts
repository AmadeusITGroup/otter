/* eslint-disable no-console -- only using the reference */
import {
  getResponseReviver,
  preparePathParams,
  prepareUrl,
  ReviverType,
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

describe('Prepare URL with query parameters', () => {
  it('should correctly prepare url with query parameters of deprecated type', () => {
    // primitive value
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: '5' })).toEqual('https://sampleUrl/samplePath/sampleOperation?id=5');
    // array value
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: '3,4,5' })).toEqual('https://sampleUrl/samplePath/sampleOperation?id=3,4,5');
  });

  it('should correctly prepare url with serialized query parameters', () => {
    // value = primitive, exploded = true, style = form
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: '5', exploded: true, style: 'form' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=5');

    // value = primitive, exploded = false, style = form
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: '5', exploded: false, style: 'form' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=5');

    // value = array, exploded = true, style = form
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: [3, 4, 5], exploded: true, style: 'form' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=3&id=4&id=5');

    // value = array, exploded = false, style = form
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: [3, 4, 5], exploded: false, style: 'form' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=3,4,5');

    // value = array, exploded = true, style = spaceDelimited
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: [3, 4, 5], exploded: true, style: 'spaceDelimited' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=3&id=4&id=5');

    // value = array, exploded = false, style = spaceDelimited
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: [3, 4, 5], exploded: false, style: 'spaceDelimited' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=3%204%205');

    // value = array, exploded = true, style = pipeDelimited
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: [3, 4, 5], exploded: true, style: 'pipeDelimited' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=3&id=4&id=5');

    // value = array, exploded = false, style = pipeDelimited
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: [3, 4, 5], exploded: false, style: 'pipeDelimited' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=3|4|5');

    // value = object, exploded = true, style = form
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: { role: 'admin', firstName: 'Alex' }, exploded: true, style: 'form' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?role=admin&firstName=Alex');

    // value = object, exploded = false, style = form
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: { role: 'admin', firstName: 'Alex' }, exploded: false, style: 'form' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id=role,admin,firstName,Alex');

    // value = object, exploded = true, style = deepObject
    expect(prepareUrl('https://sampleUrl/samplePath/sampleOperation', { id: { value: { role: 'admin', firstName: 'Alex' }, exploded: true, style: 'deepObject' } }))
      .toEqual('https://sampleUrl/samplePath/sampleOperation?id[role]=admin&id[firstName]=Alex');

    // multiple parameters
    expect(
      prepareUrl('https://sampleUrl/samplePath/sampleOperation', {
        id: { value: [3, 4, 5], exploded: false, style: 'form' },
        id2: { value: '5', exploded: true, style: 'form' } }
      )
    ).toEqual('https://sampleUrl/samplePath/sampleOperation?id=3,4,5&id2=5');
  });
});

describe('Prepare path parameters for the base path of the URL', () => {
  const mockData = {
    idPrimitive: '5',
    idArray: ['3', '4', '5'],
    idObject: { role: 'admin', firstName: 'Alex' }
  };

  it('should correctly prepare serialized path parameters', () => {
    const pathParametersSimpleExploded = preparePathParams(mockData, {
      idPrimitive: { exploded: true, style: 'simple' },
      idArray: { exploded: true, style: 'simple' },
      idObject: { exploded: true, style: 'simple' }
    });
    expect(pathParametersSimpleExploded.idPrimitive).toEqual('5');
    expect(pathParametersSimpleExploded.idArray).toEqual('3,4,5');
    expect(pathParametersSimpleExploded.idObject).toEqual('role=admin,firstName=Alex');

    const pathParametersSimple = preparePathParams(mockData, {
      idPrimitive: { exploded: false, style: 'simple' },
      idArray: { exploded: false, style: 'simple' },
      idObject: { exploded: false, style: 'simple' }
    });
    expect(pathParametersSimple.idPrimitive).toEqual('5');
    expect(pathParametersSimple.idArray).toEqual('3,4,5');
    expect(pathParametersSimple.idObject).toEqual('role,admin,firstName,Alex');

    const pathParametersLabelExploded = preparePathParams(mockData, {
      idPrimitive: { exploded: true, style: 'label' },
      idArray: { exploded: true, style: 'label' },
      idObject: { exploded: true, style: 'label' }
    });
    expect(pathParametersLabelExploded.idPrimitive).toEqual('.5');
    expect(pathParametersLabelExploded.idArray).toEqual('.3.4.5');
    expect(pathParametersLabelExploded.idObject).toEqual('.role=admin.firstName=Alex');

    const pathParametersLabel = preparePathParams(mockData, {
      idPrimitive: { exploded: false, style: 'label' },
      idArray: { exploded: false, style: 'label' },
      idObject: { exploded: false, style: 'label' }
    });
    expect(pathParametersLabel.idPrimitive).toEqual('.5');
    expect(pathParametersLabel.idArray).toEqual('.3,4,5');
    expect(pathParametersLabel.idObject).toEqual('.role,admin,firstName,Alex');

    const pathParametersMatrixExploded = preparePathParams(mockData, {
      idPrimitive: { exploded: true, style: 'matrix' },
      idArray: { exploded: true, style: 'matrix' },
      idObject: { exploded: true, style: 'matrix' }
    });
    expect(pathParametersMatrixExploded.idPrimitive).toEqual(';idPrimitive=5');
    expect(pathParametersMatrixExploded.idArray).toEqual(';idArray=3;idArray=4;idArray=5');
    expect(pathParametersMatrixExploded.idObject).toEqual(';role=admin;firstName=Alex');

    const pathParametersMatrix = preparePathParams(mockData, {
      idPrimitive: { exploded: false, style: 'matrix' },
      idArray: { exploded: false, style: 'matrix' },
      idObject: { exploded: false, style: 'matrix' }
    });
    expect(pathParametersMatrix.idPrimitive).toEqual(';idPrimitive=5');
    expect(pathParametersMatrix.idArray).toEqual(';idArray=3,4,5');
    expect(pathParametersMatrix.idObject).toEqual(';idObject=role,admin,firstName,Alex');
  });
});
