import {
  writeModelFile,
} from './file-system/write-model.mjs';
import type {
  RetrievedDependencyModel,
} from './manifest/extract-dependency-models.mjs';
import {
  processModel,
} from './process.mjs';
import {
  deserialize,
  serialize,
} from './serialization.mjs';
import {
  addAnnotation,
} from './transforms/add-annotation.mjs';
import {
  applyMask,
} from './transforms/apply-mask.mjs';
import {
  renameTitle,
} from './transforms/rename.mjs';
import {
  toReference,
} from './transforms/to-reference.mjs';
import {
  updateReferences,
} from './transforms/update-references.mjs';

const mockSpecification = { title: 'OriginalTitle', testField: 'testValue' };

jest.mock('./file-system/write-model.mjs', () => ({
  writeModelFile: jest.fn()
}));
jest.mock('./serialization.mjs', () => ({
  deserialize: jest.fn().mockImplementation(() => mockSpecification),
  serialize: jest.fn().mockImplementation((spec) => JSON.stringify(spec, null, 2))
}));
jest.mock('./transforms/add-annotation.mjs', () => ({
  addAnnotation: jest.fn().mockImplementation((spec) => spec)
}));
jest.mock('./transforms/apply-mask.mjs', () => ({
  applyMask: jest.fn().mockImplementation((spec) => spec)
}));
jest.mock('./transforms/rename.mjs', () => ({
  renameTitle: jest.fn().mockImplementation((spec) => spec)
}));
jest.mock('./transforms/to-reference.mjs', () => ({
  toReference: jest.fn().mockImplementation((spec) => spec)
}));
jest.mock('./transforms/update-references.mjs', () => ({
  updateReferences: jest.fn().mockImplementation((spec) => spec)
}));

describe('processModel', () => {
  const mockLogger = {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    log: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it('should process the model by applying all transformations and annotations', async () => {
    const mockRetrievedModel: RetrievedDependencyModel = {
      artifactName: 'test-artifact',
      version: '1.2.3',
      model: { path: 'models/test-model.json' },
      content: 'fake-content',
      isInputJson: true,
      isOutputJson: true,
      transform: {
        titleRename: 'RenamedTitle',
        fileRename: 'renamed-model.json',
        mask: { properties: { fieldToMask: false } }
      }
    } as any;

    const mockContext = { cwd: '', logger: mockLogger };
    await Promise.all(processModel([Promise.resolve(mockRetrievedModel)], mockContext));

    expect(deserialize).toHaveBeenCalledWith('fake-content', mockRetrievedModel);
    expect(addAnnotation).toHaveBeenCalledWith(mockSpecification, mockRetrievedModel, mockContext);
    expect(renameTitle).toHaveBeenCalledWith(mockSpecification, mockRetrievedModel, mockContext);
    expect(applyMask).toHaveBeenCalledWith(mockSpecification, mockRetrievedModel, mockContext);
    expect(toReference).toHaveBeenCalledWith(mockSpecification, mockRetrievedModel, mockContext);
    expect(updateReferences).toHaveBeenCalledWith(mockSpecification, mockRetrievedModel, mockContext);
    expect(serialize).toHaveBeenCalledWith(mockSpecification, mockRetrievedModel);
    expect(writeModelFile).toHaveBeenCalledWith(expect.objectContaining({
      ...mockRetrievedModel,
      content: JSON.stringify(mockSpecification, null, 2)
    }), mockContext);
  });
});
