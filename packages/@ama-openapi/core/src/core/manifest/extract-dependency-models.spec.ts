import {
  promises as fs,
} from 'node:fs';
import {
  extractDependencyModelsObject,
  sanitizePackagePath,
} from './extract-dependency-models.mjs';
import type {
  Transform,
} from './manifest.mts';

// Mock dependencies
jest.mock('node:fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue('{"test": "data"}'),
    stat: jest.fn().mockResolvedValue({ isFile: () => true } as any)
  }
}));
jest.mock('node:module', () => ({
  createRequire: jest.fn().mockReturnValue({
    resolve: jest.fn().mockReturnValue('/node_modules/some-package/index.json')
  })
}));

describe('extract-dependency-models', () => {
  const mockCwd = '/test/cwd';
  const mockContext = {
    logger: {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    },
    cwd: mockCwd
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractDependencyModelsObject', () => {
    const mockDependencyName = 'test-dependency';
    const mockModel = {
      name: 'TestModel',
      path: './models/test-model.json',
      transform: 'test-transform'
    };
    const mockTransform = jest.fn();

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
        resolve: jest.fn().mockReturnValue('/node_modules/@test/package/index.js')
      };
      jest.doMock('node:module', () => ({
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
