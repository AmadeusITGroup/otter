import type {
  OpenAPIV2,
  OpenAPIV3
} from 'openapi-types';
import {
  generateOperationFinderFromSingleFile
} from './path-extractor';

describe('generateOperationFinderFromSingleFile', () => {
  it('should parse a full path object', () => {
    const spec: OpenAPIV3.Document = {
      openapi: '3.0.0',
      info: {
        title: 'test',
        version: '0.0.0'
      },
      paths: {
        '/pet': {
          post: {
            description: 'Add a new pet to the store',
            operationId: 'addPet',
            responses: {
              200: {
                $ref: ''
              },
              405: {
                $ref: ''
              }
            }
          },
          put: {
            description: 'Update an existing pet by Id',
            operationId: 'updatePet',
            responses: {
              200: {
                $ref: ''
              },
              405: {
                $ref: ''
              }
            }
          }
        },

        '/pet/{petId}': {
          get: {
            description: 'Returns a single pet',
            operationId: 'getPetById',
            responses: {
              200: {
                $ref: ''
              },
              405: {
                $ref: ''
              }
            }
          }
        }
      }
    };

    const result = generateOperationFinderFromSingleFile(spec);
    expect(result).toEqual([
      {
        path: '/pet', regexp: new RegExp('^/pet(?:/(?=$))?$'), operations: [{ 'method': 'post', 'operationId': 'addPet' }, { 'method': 'put', 'operationId': 'updatePet' }]
      },
      {
        path: '/pet/{petId}', regexp: new RegExp('^/pet/((?:[^/]+?))(?:/(?=$))?$'), operations: [{ 'method': 'get', 'operationId': 'getPetById' }]
      }
    ]);
  });

  it('should parse a path object with reference', () => {
    const spec: OpenAPIV3.Document = {
      openapi: '3.0.0',
      info: {
        title: 'test',
        version: '0.0.0'
      },
      paths: {
        '/pet': {
          $ref: '#/components/schemas'
        }
      },
      components: {
        schemas: {
          post: {
            description: 'Add a new pet to the store',
            operationId: 'addPet',
            responses: {
              200: {
                $ref: ''
              },
              405: {
                $ref: ''
              }
            }
          } as any
        }
      }
    };

    const result = generateOperationFinderFromSingleFile(spec);
    expect(result).toEqual([
      {
        path: '/pet', regexp: new RegExp('^/pet(?:/(?=$))?$'), operations: [{ 'method': 'post', 'operationId': 'addPet' }]
      }
    ]);
  });

  it('should add the basepath in the returned regexp', () => {
    const spec1: OpenAPIV2.Document = {
      swagger: '2.0',
      basePath: '/v2',
      info: {
        title: 'test',
        version: '0.0.0'
      },
      paths: {
        '/pet': {
          $ref: '#/definitions/schemas'
        }
      },
      definitions: {
        schemas: {
          post: {
            description: 'Add a new pet to the store',
            operationId: 'addPet',
            responses: {
              200: {
                $ref: ''
              },
              405: {
                $ref: ''
              }
            }
          } as any
        }
      }
    };

    const result1 = generateOperationFinderFromSingleFile(spec1);
    expect(result1).toEqual([
      {
        path: '/pet', regexp: new RegExp('^/v2/pet(?:/(?=$))?$'), operations: [{ 'method': 'post', 'operationId': 'addPet' }]
      }
    ]);

    const spec2: OpenAPIV2.Document = {
      ...spec1,
      basePath: '/v3/'
    };

    const result2 = generateOperationFinderFromSingleFile(spec2);
    expect(result2).toEqual([
      {
        path: '/pet', regexp: new RegExp('^/v3/pet(?:/(?=$))?$'), operations: [{ 'method': 'post', 'operationId': 'addPet' }]
      }
    ]);

    const spec3: OpenAPIV2.Document = {
      ...spec1,
      basePath: undefined
    };

    const result3 = generateOperationFinderFromSingleFile(spec3);
    expect(result3).toEqual([
      {
        path: '/pet', regexp: new RegExp('^/pet(?:/(?=$))?$'), operations: [{ 'method': 'post', 'operationId': 'addPet' }]
      }
    ]);
  });
});
