import {
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
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
  walkInnerPath,
} from './references/walk-innerpath.mjs';
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

vi.mock('./file-system/write-model.mjs', () => ({
  writeModelFile: vi.fn()
}));
vi.mock('./references/walk-innerpath.mjs', () => ({
  walkInnerPath: vi.fn()
}));
vi.mock('./serialization.mjs', () => ({
  deserialize: vi.fn().mockImplementation(() => mockSpecification),
  serialize: vi.fn().mockImplementation((spec) => JSON.stringify(spec, null, 2))
}));
vi.mock('./transforms/add-annotation.mjs', () => ({
  addAnnotation: vi.fn().mockImplementation((spec) => spec)
}));
vi.mock('./transforms/apply-mask.mjs', () => ({
  applyMask: vi.fn().mockImplementation((spec) => spec)
}));
vi.mock('./transforms/rename.mjs', () => ({
  renameTitle: vi.fn().mockImplementation((spec) => spec)
}));
vi.mock('./transforms/to-reference.mjs', () => ({
  toReference: vi.fn().mockImplementation((spec) => spec)
}));
vi.mock('./transforms/update-references.mjs', () => ({
  updateReferences: vi.fn().mockImplementation((spec) => spec)
}));

describe('processModel', () => {
  const mockLogger = {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    log: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (walkInnerPath as Mock).mockReturnValue(mockSpecification);
  });

  it('should process the model by applying all transformations and annotations', async () => {
    const mockRetrievedModel: RetrievedDependencyModel = {
      artifactName: 'test-artifact',
      version: '1.2.3',
      model: {
        path: 'models/test-model.json',
        filePath: 'models/test-model.json'
      },
      content: 'fake-content',
      isInputJson: true,
      isOutputJson: true,
      transform: {
        titleRename: 'RenamedTitle',
        rename: 'renamed-model.json',
        mask: { properties: { fieldToMask: false } }
      }
    } as any;

    const mockContext = { cwd: '', logger: mockLogger };
    await Promise.all(processModel([Promise.resolve(mockRetrievedModel)], mockContext));

    expect(deserialize).toHaveBeenCalledWith('fake-content', mockRetrievedModel);
    expect(walkInnerPath).toHaveBeenCalledWith(mockSpecification, mockRetrievedModel);
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

  it('should throw an error and log when walkInnerPath returns undefined', async () => {
    (walkInnerPath as Mock).mockReturnValue(undefined);

    const mockRetrievedModel: RetrievedDependencyModel = {
      artifactName: 'test-artifact',
      version: '1.2.3',
      model: {
        path: 'models/test-model.json',
        filePath: 'models/test-model.json',
        innerPath: 'invalid/path'
      },
      modelPath: '/path/to/model.json',
      content: 'fake-content',
      isInputJson: true,
      isOutputJson: true
    } as any;

    const mockContext = { cwd: '', logger: mockLogger };
    const promises = processModel([Promise.resolve(mockRetrievedModel)], mockContext);

    await expect(Promise.all(promises)).rejects.toThrow(
      "The path 'models/test-model.json' can not be resolved in the model at test-artifact"
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Inner path 'invalid/path' not found in model at /path/to/model.json"
    );
    expect(walkInnerPath).toHaveBeenCalledWith(mockSpecification, mockRetrievedModel);
    expect(deserialize).toHaveBeenCalledWith('fake-content', mockRetrievedModel);
    // Transforms should not be called when walkInnerPath fails
    expect(addAnnotation).not.toHaveBeenCalled();
    expect(renameTitle).not.toHaveBeenCalled();
    expect(applyMask).not.toHaveBeenCalled();
    expect(toReference).not.toHaveBeenCalled();
    expect(updateReferences).not.toHaveBeenCalled();
    expect(serialize).not.toHaveBeenCalled();
    expect(writeModelFile).not.toHaveBeenCalled();
  });

  it('should handle walkInnerPath returning undefined without innerPath specified', async () => {
    (walkInnerPath as Mock).mockReturnValue(undefined);

    const mockRetrievedModel: RetrievedDependencyModel = {
      artifactName: 'test-artifact',
      version: '1.2.3',
      model: {
        path: 'models/test-model.json',
        filePath: 'models/test-model.json'
      },
      modelPath: '/path/to/model.json',
      content: 'fake-content',
      isInputJson: true,
      isOutputJson: true
    } as any;

    const mockContext = { cwd: '', logger: mockLogger };
    const promises = processModel([Promise.resolve(mockRetrievedModel)], mockContext);

    await expect(Promise.all(promises)).rejects.toThrow(
      "The path 'models/test-model.json' can not be resolved in the model at test-artifact"
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Inner path 'undefined' not found in model at /path/to/model.json"
    );
  });
});
