import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';
import {
  addAnnotation,
} from './add-annotation.mjs';

describe('addAnnotation', () => {
  const mockCwd = '/test/cwd';
  const mockContext = {
    logger: {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    },
    cwd: mockCwd
  } as any;

  it('should add the correct annotations to the specification', () => {
    const mockSpecification = { testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {
      artifactName: 'test-artifact',
      version: '1.2.3',
      model: {
        path: 'models/test-model.yaml'
      }
    } as any;

    const annotatedSpecification = addAnnotation(mockSpecification, mockRetrievedModel, mockContext);
    expect(annotatedSpecification.testField).toEqual('testValue');
    expect(annotatedSpecification['x-internal-masked']).toEqual(false);
    expect(annotatedSpecification['x-internal-touched']).toEqual(false);
    expect(annotatedSpecification['x-internal-source']).toEqual('test-artifact/models/test-model.yaml');
    expect(annotatedSpecification['x-internal-version']).toEqual('1.2.3');
  });

  it('should correctly set masked and touched annotations', () => {
    const mockSpecification = { testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {
      artifactName: 'test-artifact',
      version: '1.2.3',
      model: {
        path: 'models/test-model.yaml'
      },
      transform: {
        rename: 'renamed-model',
        mask: { properties: { fieldToMask: false } }
      }
    } as any;

    const annotatedSpecification = addAnnotation(mockSpecification, mockRetrievedModel, mockContext);
    expect(annotatedSpecification['x-internal-masked']).toEqual(true);
    expect(annotatedSpecification['x-internal-touched']).toEqual(true);
  });

  it('should handle absence of transform gracefully', () => {
    const mockSpecification = { testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {
      artifactName: 'test-artifact',
      version: '1.2.3',
      model: {
        path: 'models/test-model.yaml'
      },
      transform: {
        rename: 'renamed-model'
      }
    } as any;

    const annotatedSpecification = addAnnotation(mockSpecification, mockRetrievedModel, mockContext);
    expect(annotatedSpecification['x-internal-masked']).toEqual(false);
    expect(annotatedSpecification['x-internal-touched']).toEqual(true);
  });
});
