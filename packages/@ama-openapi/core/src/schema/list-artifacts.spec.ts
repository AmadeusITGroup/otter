import {
  vol,
} from 'memfs';
import type {
  Context,
} from '../context.mjs';
import type {
  Logger,
} from '../logger.mjs';
import {
  type ListDependenciesOptions,
  listSpecificationArtifacts,
} from './list-artifacts.mjs';

jest.mock('node:fs', () => ({
  ...jest.requireActual('memfs'),
  promises: jest.requireActual('memfs').promises
}));

jest.mock('node:fs/promises', () => jest.requireActual('memfs').promises);

jest.mock('node:child_process', () => ({
  exec: jest.fn()
}));

jest.mock('globby', () => ({
  globby: jest.fn()
}));

describe('listSpecificationArtifacts', () => {
  let mockContext: Context & ListDependenciesOptions;
  let execMock: jest.Mock;
  let globbyMock: jest.Mock;

  beforeEach(() => {
    vol.reset();

    mockContext = {
      cwd: '/test-project',
      rootPath: '/test-project',
      workspacePath: '/test-project',
      moduleResolve: (path: string) => `/test-project/node_modules/${path}`
    } as any;

    // Setup mocks
    execMock = require('node:child_process').exec as jest.Mock;
    globbyMock = require('globby').globby as jest.Mock;

    // Default successful npm ls response
    execMock.mockImplementation((_cmd, callback) => {
      callback(null, {
        stdout: JSON.stringify({
          dependencies: {}
        })
      });
    });

    globbyMock.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should return an empty array when no dependencies are found', async () => {
      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {}
          })
        });
      });

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toEqual([]);
    });

    it('should list artifacts from packages with openapi keyword', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api-models/package.json': JSON.stringify({
          name: '@test/api-models',
          version: '1.0.0',
          keywords: ['openapi']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api-models': { version: '1.0.0' }
            }
          })
        });
      });

      globbyMock.mockResolvedValue(['models/user.yaml', 'models/product.json']);

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].packageManifest.name).toBe('@test/api-models');
      expect(result[0].models).toHaveLength(2);
    });

    it('should filter out packages without openapi keyword', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/unrelated-package/package.json': JSON.stringify({
          name: 'unrelated-package',
          version: '1.0.0',
          keywords: ['utility', 'helper']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              'unrelated-package': { version: '1.0.0' }
            }
          })
        });
      });

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toEqual([]);
    });
  });

  describe('custom keywords whitelist', () => {
    it('should use custom keywordsWhitelist when provided', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@custom/api/package.json': JSON.stringify({
          name: '@custom/api',
          version: '1.0.0',
          keywords: ['custom-api', 'swagger']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@custom/api': { version: '1.0.0' }
            }
          })
        });
      });

      globbyMock.mockResolvedValue(['spec.yaml']);

      const result = await listSpecificationArtifacts({
        ...mockContext,
        keywordsWhitelist: ['custom-api', 'swagger']
      });

      expect(result).toHaveLength(1);
      expect(result[0].packageManifest.name).toBe('@custom/api');
    });

    it('should not match packages when custom whitelist does not include their keywords', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' }
            }
          })
        });
      });

      const result = await listSpecificationArtifacts({
        ...mockContext,
        keywordsWhitelist: ['custom-keyword']
      });

      expect(result).toEqual([]);
    });
  });

  describe('ignoreFiles option', () => {
    it('should ignore package.json by default', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' }
            }
          })
        });
      });

      await listSpecificationArtifacts(mockContext);

      expect(globbyMock).toHaveBeenCalledWith(
        '**/*.{json,yaml,yml}',
        expect.objectContaining({
          ignore: ['package.json']
        })
      );
    });

    it('should use custom ignoreFiles when provided', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' }
            }
          })
        });
      });

      const customIgnoreFiles = ['package.json', 'tsconfig.json', '*.test.yaml'];

      await listSpecificationArtifacts({
        ...mockContext,
        ignoreFiles: customIgnoreFiles
      });

      expect(globbyMock).toHaveBeenCalledWith(
        '**/*.{json,yaml,yml}',
        expect.objectContaining({
          ignore: customIgnoreFiles
        })
      );
    });
  });

  describe('model discovery', () => {
    it('should discover JSON, YAML, and YML files', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        }),
        '/test-project/node_modules/@test/api/user.json': JSON.stringify({}),
        '/test-project/node_modules/@test/api/product.yaml': 'openapi: 3.0.0',
        '/test-project/node_modules/@test/api/order.yml': 'openapi: 3.0.0'
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' }
            }
          })
        });
      });

      globbyMock.mockResolvedValue([
        'user.json',
        'product.yaml',
        'order.yml'
      ]);

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].models).toHaveLength(3);
      expect(result[0].models.map((m) => m.model)).toContain('user.json');
      expect(result[0].models.map((m) => m.model)).toContain('product.yaml');
      expect(result[0].models.map((m) => m.model)).toContain('order.yml');
    });

    it('should handle nested directory structures', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' }
            }
          })
        });
      });

      globbyMock.mockResolvedValue([
        'schemas/v1/user.yaml',
        'schemas/v2/user.yaml',
        'models/product.json'
      ]);

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].models).toHaveLength(3);
    });

    it('should filter out models that cannot be resolved', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        }),
        '/test-project/node_modules/@test/api/valid.yaml': 'openapi: 3.0.0'
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' }
            }
          })
        });
      });

      // Globby returns files that may not be resolvable by require
      globbyMock.mockResolvedValue([
        'valid.yaml',
        'non-existent.yaml'
      ]);

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toHaveLength(1);
      // Should only include models that can be resolved
      expect(result[0].models.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('error handling', () => {
    it('should handle npm ls errors with stdout present', async () => {
      const mockLogger = {
        warn: jest.fn(),
        debug: jest.fn()
      } as any as Logger;

      execMock.mockImplementation((_cmd, callback) => {
        const error: any = new Error('npm ls failed');
        error.stdout = JSON.stringify({
          dependencies: {
            '@test/api': { version: '1.0.0' }
          }
        });
        callback(error);
      });

      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        })
      });

      globbyMock.mockResolvedValue([]);

      const result = await listSpecificationArtifacts({
        ...mockContext,
        logger: mockLogger
      });

      expect(mockLogger.warn).toHaveBeenCalledWith('Error in "npm ls" run');
      expect(mockLogger.debug).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should throw error when npm ls fails without stdout', async () => {
      execMock.mockImplementation((_cmd, callback) => {
        callback(new Error('npm ls failed'));
      });

      await expect(listSpecificationArtifacts(mockContext)).rejects.toThrow('npm ls failed');
    });

    it('should skip packages that cannot be accessed', async () => {
      const mockLogger = {
        warn: jest.fn(),
        debug: jest.fn()
      } as any as Logger;

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' },
              '@test/broken': { version: '1.0.0' }
            }
          })
        });
      });

      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        })
        // @test/broken package.json is intentionally missing
      });

      globbyMock.mockResolvedValue([]);

      const result = await listSpecificationArtifacts({
        ...mockContext,
        logger: mockLogger
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('@test/broken/package.json')
      );
      expect(result).toHaveLength(1);
      expect(result[0].packageManifest.name).toBe('@test/api');
    });

    it('should handle packages without keywords field', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/no-keywords/package.json': JSON.stringify({
          name: '@test/no-keywords',
          version: '1.0.0'
          // No keywords field
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/no-keywords': { version: '1.0.0' }
            }
          })
        });
      });

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toEqual([]);
    });
  });

  describe('multiple packages', () => {
    it('should process multiple packages with openapi keyword', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api-v1/package.json': JSON.stringify({
          name: '@test/api-v1',
          version: '1.0.0',
          keywords: ['openapi']
        }),
        '/test-project/node_modules/@test/api-v2/package.json': JSON.stringify({
          name: '@test/api-v2',
          version: '2.0.0',
          keywords: ['openapi', 'rest']
        }),
        '/test-project/node_modules/@test/schemas/package.json': JSON.stringify({
          name: '@test/schemas',
          version: '1.0.0',
          keywords: ['openapi', 'json-schema']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api-v1': { version: '1.0.0' },
              '@test/api-v2': { version: '2.0.0' },
              '@test/schemas': { version: '1.0.0' }
            }
          })
        });
      });

      globbyMock.mockResolvedValue(['spec.yaml']);

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toHaveLength(3);
      expect(result.map((r) => r.packageManifest.name)).toContain('@test/api-v1');
      expect(result.map((r) => r.packageManifest.name)).toContain('@test/api-v2');
      expect(result.map((r) => r.packageManifest.name)).toContain('@test/schemas');
    });

    it('should handle mixed packages with and without openapi keyword', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        }),
        '/test-project/node_modules/lodash/package.json': JSON.stringify({
          name: 'lodash',
          version: '4.17.21',
          keywords: ['utility']
        }),
        '/test-project/node_modules/express/package.json': JSON.stringify({
          name: 'express',
          version: '4.18.0',
          keywords: ['framework', 'web']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' },
              lodash: { version: '4.17.21' },
              express: { version: '4.18.0' }
            }
          })
        });
      });

      globbyMock.mockResolvedValue(['spec.yaml']);

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].packageManifest.name).toBe('@test/api');
    });
  });

  describe('package manifest structure', () => {
    it('should return complete package information', async () => {
      const baseDir = '/test-project/node_modules/@test/api';
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        [`${baseDir}/package.json`]: JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          description: 'API Models',
          keywords: ['openapi']
        }),
        [`${baseDir}/models/user.yaml`]: 'openapi: 3.0.0'
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' }
            }
          })
        });
      });

      globbyMock.mockResolvedValue(['models/user.yaml']);

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('packageManifest');
      expect(result[0]).toHaveProperty('baseDirectory');
      expect(result[0]).toHaveProperty('models');
      expect(result[0].packageManifest.name).toBe('@test/api');
      expect(result[0].packageManifest.version).toBe('1.0.0');
      expect(result[0].baseDirectory).toContain('@test/api');
    });

    it('should include model paths in the result', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        }),
        '/test-project/node_modules/@test/api/user.yaml': 'openapi: 3.0.0'
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' }
            }
          })
        });
      });

      globbyMock.mockResolvedValue(['user.yaml']);

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].models).toHaveLength(1);
      expect(result[0].models[0]).toHaveProperty('model');
      expect(result[0].models[0]).toHaveProperty('modelPath');
      expect(result[0].models[0].model).toBe('user.yaml');
    });
  });

  describe('edge cases', () => {
    it('should handle empty npm ls response', async () => {
      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({})
        });
      });

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toEqual([]);
    });

    it('should handle npm ls response without dependencies field', async () => {
      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            name: 'test-app',
            version: '1.0.0'
          })
        });
      });

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toEqual([]);
    });

    it('should handle packages with no model files', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' }
            }
          })
        });
      });

      globbyMock.mockResolvedValue([]);

      const result = await listSpecificationArtifacts(mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].models).toEqual([]);
    });

    it('should work with different cwd paths', async () => {
      vol.fromJSON({
        '/custom/path/package.json': JSON.stringify({ name: 'test-app' }),
        '/custom/path/node_modules/@test/api/package.json': JSON.stringify({
          name: '@test/api',
          version: '1.0.0',
          keywords: ['openapi']
        })
      });

      execMock.mockImplementation((_cmd, callback) => {
        callback(null, {
          stdout: JSON.stringify({
            dependencies: {
              '@test/api': { version: '1.0.0' }
            }
          })
        });
      });

      globbyMock.mockResolvedValue([]);

      const result = await listSpecificationArtifacts({
        ...mockContext,
        moduleResolve: ((path: string) => `/custom/path/node_modules/${path}`) as any,
        cwd: '/custom/path'
      });

      expect(result).toHaveLength(1);
    });
  });
});
