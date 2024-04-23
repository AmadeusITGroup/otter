/* eslint-disable @typescript-eslint/naming-convention */
import type { OpenAPIV3 } from 'openapi-types';
import { generateOperationFinderFromSingleFile } from './path-extractor';

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
        // eslint-disable-next-line @typescript-eslint/naming-convention
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

});
