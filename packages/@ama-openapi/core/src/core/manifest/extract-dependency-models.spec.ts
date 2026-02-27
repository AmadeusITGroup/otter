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
  extractDependencyModelsObject,
  sanitizePackagePath,
} from './extract-dependency-models.mjs';
import type {
  Transform,
} from './manifest.mts';

// Mock dependencies
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
