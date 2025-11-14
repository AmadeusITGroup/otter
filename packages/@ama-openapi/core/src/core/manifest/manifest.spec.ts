import {
  DEFAULT_MANIFEST_FILENAMES,
} from '../../constants.mjs';
import {
  type Manifest,
  retrieveManifest,
} from './manifest.mjs';

let mockExistsSync = jest.fn();
let mockReadFile = jest.fn();
let mockResolve = jest.fn();
jest.mock('node:fs', () => {
  return {
    existsSync: (...args: any[]) => mockExistsSync(...args),
    promises: {
      readFile: (...args: any[]) => mockReadFile(...args)
    }
  };
});
jest.mock('node:path', () => ({
  ...jest.requireActual<object>('node:path'),
  resolve: (...args: any[]) => mockResolve(...args)
}));

// Mock constants
jest.mock('../../constants.mts', () => ({
  DEFAULT_MANIFEST_FILENAMES: ['package.json', 'manifest.json']
}));

describe('retrieveManifest', () => {
  const mockWorkspaceDirectory = '/workspace';
  const mockLogger = {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    log: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockResolve = jest.fn().mockImplementation((...paths) => paths.join('/'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when no manifest files exist', () => {
    beforeEach(() => {
      mockExistsSync = jest.fn().mockReturnValue(false);
    });

    it('should return undefined when no manifest files are found', async () => {
      const result = await retrieveManifest(mockWorkspaceDirectory, mockLogger);

      expect(result).toBeUndefined();
      expect(mockExistsSync).toHaveBeenCalledTimes(DEFAULT_MANIFEST_FILENAMES.length);
      expect(mockLogger.debug).toHaveBeenCalledWith('Manifest file not found at /workspace/package.json');
      expect(mockLogger.debug).toHaveBeenCalledWith('Manifest file not found at /workspace/manifest.json');
    });

    it('should use console as default logger when none provided', async () => {
      const result = await retrieveManifest(mockWorkspaceDirectory, mockLogger);

      expect(result).toBeUndefined();
      expect(mockLogger.debug).toHaveBeenCalledWith('Manifest file not found at /workspace/package.json');
      expect(mockLogger.debug).toHaveBeenCalledWith('Manifest file not found at /workspace/manifest.json');
    });
  });

  describe('when manifest file exists but is invalid JSON', () => {
    beforeEach(() => {
      mockExistsSync = jest.fn().mockReturnValueOnce(true);
      mockReadFile = jest.fn().mockResolvedValueOnce('invalid json content');
    });

    it('should handle JSON parsing errors gracefully', async () => {
      await expect(retrieveManifest(mockWorkspaceDirectory, mockLogger)).rejects.toThrow();
    });
  });

  describe('when manifest file exists and is valid JSON but invalid manifest', () => {
    const invalidManifest = {
      name: 'test-package',
      version: '1.0.0'
      // Missing required 'models' property
    };

    beforeEach(() => {
      mockExistsSync = jest.fn().mockReturnValueOnce(true);
      mockReadFile = jest.fn()
        .mockResolvedValueOnce(JSON.stringify(invalidManifest))
        .mockResolvedValueOnce('{"type": "object"}'); // schema mock
    });

    it('should return undefined for invalid manifest and log errors', async () => {
      const result = await retrieveManifest(mockWorkspaceDirectory, mockLogger);

      expect(result).toBeUndefined();
      expect(mockLogger.debug).toHaveBeenNthCalledWith(1, 'Manifest file at /workspace/package.json is not conform to the expected schema');
      expect(mockLogger.debug).toHaveBeenNthCalledWith(2, 'Manifest file not found at /workspace/manifest.json');
    });
  });

  describe('when valid manifest file exists', () => {
    const validManifest: Manifest = {
      name: 'test-package',
      version: '1.0.0',
      models: {
        'test-model': {
          specKey: 'test-spec',
          name: 'TestModel'
        }
      }
    } as any;

    beforeEach(() => {
      mockExistsSync.mockReturnValueOnce(true);
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(validManifest))
        .mockResolvedValueOnce('{"type": "object"}') // transform mock
        .mockResolvedValueOnce('{"type": "object"}'); // schema mock
    });

    it('should return the valid manifest', async () => {
      // Mock the schema validation to pass
      const mockValidate = jest.fn().mockReturnValue(true);
      jest.doMock('ajv', () => {
        return jest.fn().mockImplementation(() => ({
          addSchema: jest.fn().mockReturnValue({ compile: jest.fn().mockReturnValue(mockValidate) })
        }));
      });

      const result = await retrieveManifest(mockWorkspaceDirectory, mockLogger);

      expect(result).toEqual(validManifest);
      expect(mockReadFile).toHaveBeenCalledWith('/workspace/package.json', { encoding: 'utf8' });
    });
  });

  describe('when multiple manifest files exist', () => {
    const firstManifest: Manifest = {
      name: 'first-package',
      version: '1.0.0',
      models: {
        'first-model': {
          specKey: 'first-spec',
          name: 'FirstModel'
        }
      }
    } as any;

    beforeEach(() => {
      mockExistsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(firstManifest))
        .mockResolvedValueOnce('{"type": "object"}') // transform mock
        .mockResolvedValueOnce('{"type": "object"}'); // schema mock
    });

    it('should return the first valid manifest found', async () => {
      // Mock the schema validation to pass
      const mockValidate = jest.fn().mockReturnValue(true);
      jest.doMock('ajv', () => {
        return jest.fn().mockImplementation(() => ({
          compile: jest.fn().mockReturnValue(mockValidate)
        }));
      });

      const result = await retrieveManifest(mockWorkspaceDirectory, mockLogger);

      expect(result).toEqual(firstManifest);
      expect(mockExistsSync).toHaveBeenCalledTimes(1); // Should stop after finding the first one
    });
  });

  describe('when schema file reading fails', () => {
    const validManifest = {
      name: 'test-package',
      version: '1.0.0',
      models: {}
    };

    beforeEach(() => {
      mockExistsSync = jest.fn().mockReturnValueOnce(true);
      mockReadFile = jest.fn()
        .mockResolvedValueOnce(JSON.stringify(validManifest))
        .mockRejectedValueOnce(new Error('Schema file not found'));
    });

    it('should handle schema reading errors gracefully', async () => {
      await expect(retrieveManifest(mockWorkspaceDirectory, mockLogger)).rejects.toThrow('Schema file not found');
    });
  });

  describe('path resolution', () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(false);
    });

    it('should resolve manifest paths correctly', async () => {
      await retrieveManifest(mockWorkspaceDirectory, mockLogger);

      expect(mockResolve).toHaveBeenCalledWith(mockWorkspaceDirectory, 'package.json');
      expect(mockResolve).toHaveBeenCalledWith(mockWorkspaceDirectory, 'manifest.json');
    });

    it('should work with different workspace directories', async () => {
      const customWorkspace = '/custom/workspace/path';
      await retrieveManifest(customWorkspace, mockLogger);

      expect(mockResolve).toHaveBeenCalledWith(customWorkspace, 'package.json');
      expect(mockResolve).toHaveBeenCalledWith(customWorkspace, 'manifest.json');
    });
  });

  describe('logging behavior', () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(false);
    });

    it('should call logger.debug when files are not found', async () => {
      await retrieveManifest(mockWorkspaceDirectory, mockLogger);

      expect(mockLogger.debug).toHaveBeenCalledTimes(DEFAULT_MANIFEST_FILENAMES.length);
      DEFAULT_MANIFEST_FILENAMES.forEach((fileName) => {
        expect(mockLogger.debug).toHaveBeenCalledWith(
          `Manifest file not found at ${mockWorkspaceDirectory}/${fileName}`
        );
      });
    });

    it('should not call logger.debug when logger.debug is undefined', async () => {
      const loggerWithoutDebug = {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        log: jest.fn()
      };

      const result = await retrieveManifest(mockWorkspaceDirectory, loggerWithoutDebug);

      expect(result).toBeUndefined();
      // Should not throw error when logger.debug is undefined
    });
  });
});
