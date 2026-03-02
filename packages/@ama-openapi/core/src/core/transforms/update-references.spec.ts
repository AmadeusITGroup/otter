import {
  tmpdir,
} from 'node:os';
import {
  resolve,
} from 'node:path';
import {
  REF_REWRITTEN_PROPERTY_KEY,
} from '../../constants.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';
import {
  updateReferences,
} from './update-references.mjs';

describe('updateReferences', () => {
  const mockCwd = '/test/cwd';
  const mockContext = {
    logger: {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    },
    cwd: mockCwd
  } as any;
  it('should update relative $ref references to be relative to the model output path', () => {
    const mockSpecification = {
      components: {
        schemas: {
          TestSchema: {
            $ref: './schemas/TestSchema.yaml'
          },
          AnotherSchema: {
            $ref: 'http://example.com/schemas/ExternalSchema.yaml'
          }
        }
      },
      paths: {
        '/test': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '../common/schemas/CommonSchema.yaml'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const baseTmpDir = tmpdir();
    const mockRetrievedModel: RetrievedDependencyModel = {
      modelPath: resolve(baseTmpDir, 'models/dependency-model.yaml'),
      outputFilePath: resolve(baseTmpDir, 'output/models/dependency-model.yaml')
    } as any;

    const updatedSpecification = updateReferences(mockSpecification, mockRetrievedModel, mockContext);
    expect(updatedSpecification.components.schemas.TestSchema.$ref).toEqual('../../models/schemas/TestSchema.yaml');
    expect(updatedSpecification.components.schemas.AnotherSchema.$ref).toEqual('http://example.com/schemas/ExternalSchema.yaml');
    expect(updatedSpecification.paths['/test'].get.responses['200'].content['application/json'].schema.$ref).toEqual('../../common/schemas/CommonSchema.yaml');
    expect((updatedSpecification.components.schemas.TestSchema as any)[REF_REWRITTEN_PROPERTY_KEY]).toBe(true);
    expect((updatedSpecification.components.schemas.AnotherSchema as any)[REF_REWRITTEN_PROPERTY_KEY]).toBeFalsy();
  });

  it('should not modify specification if there are no relative $ref references', () => {
    const mockSpecification = {
      components: {
        schemas: {
          TestSchema: {
            $ref: 'http://example.com/schemas/ExternalSchema.yaml'
          }
        }
      }
    };

    const mockRetrievedModel: RetrievedDependencyModel = {
      modelPath: 'models/dependency-model.yaml',
      outputFilePath: 'output/models/dependency-model.yaml'
    } as any;

    const updatedSpecification = updateReferences(mockSpecification, mockRetrievedModel, mockContext);
    expect(updatedSpecification).toEqual({
      components: {
        schemas: {
          TestSchema: {
            $ref: 'http://example.com/schemas/ExternalSchema.yaml'
          }
        }
      }
    });
  });

  it('should keep local references when valid', () => {
    const mockSpecification = {
      components: {
        schemas: {
          LocalSchema: {},
          TestSchema: {
            $ref: '#/components/schemas/LocalSchema'
          }
        }
      }
    };

    const mockRetrievedModel: RetrievedDependencyModel = {
      modelPath: 'models/dependency-model.yaml',
      outputFilePath: 'output/models/dependency-model.yaml'
    } as any;

    const updatedSpecification = updateReferences(mockSpecification, mockRetrievedModel, mockContext);
    expect(updatedSpecification).toEqual({
      components: {
        schemas: {
          LocalSchema: {},
          TestSchema: {
            $ref: '#/components/schemas/LocalSchema'
          }
        }
      }
    });
  });

  it('should redirect local references when invalid', () => {
    const mockSpecification = {
      components: {
        schemas: {
          TestSchema: {
            $ref: '#/components/schemas/LocalSchema'
          }
        }
      }
    };

    const mockRetrievedModel: RetrievedDependencyModel = {
      modelPath: 'models/dependency-model.yaml',
      outputFilePath: 'output/models/dependency-model.yaml'
    } as any;

    const updatedSpecification = updateReferences(mockSpecification, mockRetrievedModel, mockContext);
    expect(updatedSpecification).toEqual({
      components: {
        schemas: {
          TestSchema: {
            $ref: '../../models/dependency-model.yaml#/components/schemas/LocalSchema',
            'x-internal-reference-rewritten': true
          }
        }
      }
    });
  });
});
