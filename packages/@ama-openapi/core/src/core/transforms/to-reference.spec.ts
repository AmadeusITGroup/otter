import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';
import {
  toReference,
} from './to-reference.mjs';

describe('toReference', () => {
  const mockCwd = '/test/cwd';
  const mockContext = {
    logger: {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    },
    cwd: mockCwd
  } as any;

  it('should convert specification to reference when no transform is present', () => {
    const mockSpecification = { testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {
      modelPath: 'models/test-model.yaml',
      model: {},
      outputFilePath: 'output/models/test-model.yaml',
      'x-vendor-custom': 'customValue'
    } as any;

    const referenceSpecification = toReference(mockSpecification, mockRetrievedModel, mockContext);
    expect(referenceSpecification).toEqual({
      $ref: '../../models/test-model.yaml',
      'x-vendor-custom': 'customValue',
      'x-internal-reference-generated': true
    });
  });

  it('should return the original specification when transform is present', () => {
    const mockSpecification = { testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {
      modelPath: 'models/test-model.yaml',
      outputFilePath: 'output/models/test-model.yaml',
      transform: {
        mask: 'model'
      }
    } as any;

    const resultSpecification = toReference(mockSpecification, mockRetrievedModel, mockContext);
    expect(resultSpecification).toEqual(mockSpecification);
  });

  it('should convert specification to reference when allow transforms are accepted', () => {
    const mockSpecification = { testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {
      modelPath: 'models/test-model.yaml',
      outputFilePath: 'output/models/test-model.yaml',
      model: {},
      transform: {
        rename: 'test-model.yaml'
      },
      'x-vendor-custom': 'customValue'
    } as any;

    const referenceSpecification = toReference(mockSpecification, mockRetrievedModel, mockContext);
    expect(referenceSpecification).toEqual({
      $ref: '../../models/test-model.yaml',
      'x-vendor-custom': 'customValue',
      'x-internal-reference-generated': true
    });
  });

  it('should handle innerPath in the model', () => {
    const mockSpecification = { testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {
      modelPath: 'models/test-model.yaml',
      outputFilePath: 'output/models/test-model.yaml',
      model: {
        innerPath: 'components/schemas/TestModel'
      } as any
    } as any;

    const referenceSpecification = toReference(mockSpecification, mockRetrievedModel, mockContext);
    expect(referenceSpecification).toEqual({
      $ref: '../../models/test-model.yaml#/components/schemas/TestModel',
      'x-internal-reference-generated': true
    });
  });
});
