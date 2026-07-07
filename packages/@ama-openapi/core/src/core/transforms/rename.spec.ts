import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';
import {
  renameTitle,
} from './rename.mjs';

describe('renameTitle', () => {
  const mockCwd = '/test/cwd';
  const mockContext = {
    logger: {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    },
    cwd: mockCwd
  } as any;

  it('should rename the title of the specification when titleRename is provided', () => {
    const mockSpecification = { title: 'OriginalTitle', testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {
      transform: {
        titleRename: 'RenamedTitle'
      }
    } as any;

    const renamedSpecification = renameTitle(mockSpecification, mockRetrievedModel, mockContext);
    expect(renamedSpecification.title).toEqual('RenamedTitle');
    expect(renamedSpecification.testField).toEqual('testValue');
  });

  it('should not change the specification when titleRename is not provided', () => {
    const mockSpecification = { title: 'OriginalTitle', testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {} as any;

    const renamedSpecification = renameTitle(mockSpecification, mockRetrievedModel, mockContext);
    expect(renamedSpecification.title).toEqual('OriginalTitle');
    expect(renamedSpecification.testField).toEqual('testValue');
  });
});
