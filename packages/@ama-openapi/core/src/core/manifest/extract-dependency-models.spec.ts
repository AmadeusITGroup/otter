import {
  promises as fs,
} from 'node:fs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  extractDependencyModels,
  extractDependencyModelsObject,
  sanitizePackagePath,
} from './extract-dependency-models.mjs';
import type {
  Manifest,
  Transform,
} from './manifest.mts';

// Mock dependencies
vi.mock('globby', () => ({
  globbySync: vi.fn().mockReturnValue([])
}));
vi.mock('node:fs', () => ({
  promises: {
    readFile: vi.fn().mockResolvedValue('{"test": "data"}'),
    stat: vi.fn().mockResolvedValue({ isFile: () => true } as any)
  }
}));
vi.mock('node:module', () => ({
  createRequire: vi.fn().mockReturnValue({
    resolve: vi.fn().mockReturnValue('/node_modules/some-package/index.json')
  })
}));

describe('extract-dependency-models', () => {
  const mockCwd = '/test/cwd';
  const mockContext = {
    logger: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    },
    cwd: mockCwd
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractDependencyModelsObject', () => {
    const mockDependencyName = 'test-dependency';
    const mockModel = {
      name: 'TestModel',
      filePath: './models/test-model.json',
      path: './models/test-model.json',
      transform: 'test-transform'
    };
    const mockTransform = vi.fn();

    it('should extract dependency model from object configuration', async () => {
      const result = await extractDependencyModelsObject(
        mockDependencyName,
        mockModel,
        Promise.resolve(mockTransform as any as Transform),
        mockContext
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('model', mockModel);
    });

    it('should handle string model path', async () => {
      const stringModel = './models/simple-model.json';

      const result = await extractDependencyModelsObject(
        mockDependencyName,
        {
          path: stringModel
        },
        Promise.resolve(mockTransform as any as Transform),
        mockContext
      );

      expect(result).toBeDefined();
      expect(fs.readFile).toHaveBeenCalled();
    });

    it('should apply transform if provided', async () => {
      const result = await extractDependencyModelsObject(
        mockDependencyName,
        mockModel,
        Promise.resolve<Transform>({
          rename: 'test-model'
        }),
        mockContext
      );

      expect(result.modelPath).toMatch(/test-model\.json$/);
    });

    it('should handle different file extensions', async () => {
      const yamlModel = {
        ...mockModel,
        path: './models/test-model.yaml'
      };

      const result = await extractDependencyModelsObject(
        mockDependencyName,
        yamlModel,
        Promise.resolve(mockTransform as any as Transform),
        mockContext
      );

      expect(result).toBeDefined();
      expect(fs.readFile).toHaveBeenCalled();
    });

    it('should handle properly target file with inner paths', async () => {
      const yamlModel = {
        ...mockModel,
        path: './models/test-model.yaml#/definition'
      };

      const result = await extractDependencyModelsObject(
        mockDependencyName,
        yamlModel,
        Promise.resolve(mockTransform as any as Transform),
        mockContext
      );

      expect(result).toBeDefined();
      expect(fs.readFile).toHaveBeenNthCalledWith(2, expect.stringMatching(/[\\/]models[\\/]test-model\.yaml$/), expect.anything());
    });

    it('should resolve npm package paths', async () => {
      const npmModel = {
        ...mockModel,
        path: '@test/package'
      };

      // Mock require.resolve behavior
      const mockRequire = {
        resolve: vi.fn().mockReturnValue('/node_modules/@test/package/index.js')
      };
      vi.doMock('node:module', () => ({
        createRequire: () => mockRequire
      }));

      const result = await extractDependencyModelsObject(
        mockDependencyName,
        npmModel,
        Promise.resolve(mockTransform as any as Transform),
        mockContext
      );

      expect(result).toBeDefined();
    });
  });
});

describe('extractDependencyModels', () => {
  const mockCwd = '/test/cwd';
  const mockContext = {
    logger: {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    },
    cwd: mockCwd
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log the number of dependencies found in the manifest', async () => {
    const manifest: Manifest = {
      models: {
        'dep-a': './model-a.json',
        'dep-b': './model-b.json'
      }
    };

    await Promise.all(extractDependencyModels(manifest, mockContext));

    expect(mockContext.logger.info).toHaveBeenCalledWith('2 dependencies models found in the manifest');
    expect(mockContext.logger.debug).toHaveBeenCalledWith('Extracting information from the manifest configuration: ', manifest);
  });

  it('should return an empty array when the manifest has no models', () => {
    const manifest: Manifest = { models: {} };

    const result = extractDependencyModels(manifest, mockContext);

    expect(result).toEqual([]);
    expect(mockContext.logger.info).toHaveBeenCalledWith('0 dependencies models found in the manifest');
  });

  it('should handle a string model definition and return a promise', () => {
    const manifest: Manifest = {
      models: {
        'test-dependency': './models/test-model.json'
      }
    };

    const result = extractDependencyModels(manifest, mockContext);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Promise);
  });

  it('should handle a boolean model definition and return a promise', () => {
    const manifest: Manifest = {
      models: {
        'test-dependency': true
      }
    };

    const result = extractDependencyModels(manifest, mockContext);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Promise);
  });

  it('should handle an object model definition and return a promise', () => {
    const manifest: Manifest = {
      models: {
        'test-dependency': { path: './models/test-model.json' }
      }
    };

    const result = extractDependencyModels(manifest, mockContext);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Promise);
  });

  it('should handle an array of model definitions', () => {
    const manifest: Manifest = {
      models: {
        'test-dependency': [
          './models/model-a.json',
          { path: './models/model-b.json' },
          true
        ]
      }
    };

    const result = extractDependencyModels(manifest, mockContext);

    expect(result).toHaveLength(3);
    result.forEach((item) => expect(item).toBeInstanceOf(Promise));
  });

  it('should handle multiple dependencies', () => {
    const manifest: Manifest = {
      models: {
        'dep-a': './models/model-a.json',
        'dep-b': { path: './models/model-b.json' },
        'dep-c': true
      }
    };

    const result = extractDependencyModels(manifest, mockContext);

    expect(result).toHaveLength(3);
  });

  it('should resolve string model definitions with correct content', async () => {
    const manifest: Manifest = {
      models: {
        'test-dependency': './models/test-model.json'
      }
    };

    const results = extractDependencyModels(manifest, mockContext);
    const resolved = await results[0];

    expect(resolved.artifactName).toBe('test-dependency');
    expect(resolved.model.path).toBe('./models/test-model.json');
    expect(resolved.content).toBe('{"test": "data"}');
    expect(fs.readFile).toHaveBeenCalled();
  });

  it('should resolve boolean model definitions using require.resolve', async () => {
    const manifest: Manifest = {
      models: {
        'test-dependency': true
      }
    };

    const results = extractDependencyModels(manifest, mockContext);
    const resolved = await results[0];

    expect(resolved.artifactName).toBe('test-dependency');
    expect(resolved.model.path).toBe('test-dependency');
  });

  it('should resolve object model definitions with transform', async () => {
    const manifest: Manifest = {
      models: {
        'test-dependency': {
          path: './models/test-model.json',
          transform: { rename: 'renamed-model' }
        }
      }
    };

    const results = extractDependencyModels(manifest, mockContext);
    const resolved = await results[0];

    expect(resolved.artifactName).toBe('test-dependency');
    expect(resolved.transform).toEqual({ rename: 'renamed-model' });
    expect(resolved.outputFilePath).toMatch(/renamed-model/);
  });

  it('should handle mixed array of string and object model definitions', async () => {
    const manifest: Manifest = {
      models: {
        'test-dependency': [
          './models/model-a.json',
          { path: './models/model-b.json' }
        ]
      }
    };

    const results = extractDependencyModels(manifest, mockContext);
    expect(results).toHaveLength(2);

    const [first, second] = await Promise.all(results);

    expect(first.model.path).toBe('./models/model-a.json');
    expect(second.model.path).toBe('./models/model-b.json');
  });

  it('should work without a logger', () => {
    const contextWithoutLogger = { cwd: mockCwd } as any;
    const manifest: Manifest = {
      models: {
        'test-dependency': './models/test-model.json'
      }
    };

    expect(() => extractDependencyModels(manifest, contextWithoutLogger)).not.toThrow();
    const result = extractDependencyModels(manifest, contextWithoutLogger);
    expect(result).toHaveLength(1);
  });

  it('should generate output file path under sanitized artifact directory', async () => {
    const manifest: Manifest = {
      models: {
        '@scope/my-package': './models/test-model.json'
      }
    };

    const results = extractDependencyModels(manifest, mockContext);
    const resolved = await results[0];

    expect(resolved.outputFilePath).toContain('scope-my-package');
    expect(resolved.outputFilePath).not.toContain('@');
  });
});

describe('sanitizePackagePath', () => {
  it('should replace / with -', () => {
    expect(sanitizePackagePath('a/b')).toBe('a-b');
  });

  it('should replace ^/@ with empty string', () => {
    expect(sanitizePackagePath('@a/b')).toBe('a-b');
  });

  it('should not throw an error if the input is empty', () => {
    expect(sanitizePackagePath('')).toBe('');
  });
});
