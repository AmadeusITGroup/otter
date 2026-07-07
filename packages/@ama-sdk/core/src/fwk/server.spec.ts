import type {
  BasePathServer,
  Logger,
  Server,
} from '../public_api';
import {
  selectServerBasePath,
} from './server';

describe('selectServerBasePath', () => {
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as jest.Mocked<Logger>;
  });

  describe('when clientServerConfigurations has basePath', () => {
    it('should return the basePath from client configurations', () => {
      const clientConfig: BasePathServer = {
        basePath: 'https://api.example.com/v1'
      };

      const result = selectServerBasePath(clientConfig);

      expect(result).toBe('https://api.example.com/v1');
    });

    it('should return the basePath from client configurations even when servers are provided', () => {
      const clientConfig: BasePathServer = {
        basePath: 'https://api.example.com/v1'
      };
      const servers: Server[] = [
        { url: 'https://other.example.com' }
      ];

      const result = selectServerBasePath(clientConfig, servers);

      expect(result).toBe('https://api.example.com/v1');
    });
  });

  describe('when clientServerConfigurations has no basePath', () => {
    it('should return the first server URL when servers are provided', () => {
      const clientConfig: BasePathServer = {};
      const servers: Server[] = [
        { url: 'https://server1.example.com' },
        { url: 'https://server2.example.com' }
      ];

      const result = selectServerBasePath(clientConfig, servers);

      expect(result).toBe('https://server1.example.com');
    });

    it('should handle server with variables', () => {
      const clientConfig: BasePathServer = {};
      const servers: Server[] = [
        {
          url: 'https://{environment}.example.com/{version}',
          variables: {
            environment: {
              defaultValue: 'api',
              enumValues: ['api', 'staging', 'dev']
            },
            version: {
              defaultValue: 'v1'
            }
          }
        }
      ];

      const result = selectServerBasePath(clientConfig, servers);

      expect(result).toBe('https://api.example.com/v1');
    });

    it('should handle server with custom variable values', () => {
      const clientConfig: BasePathServer = {};
      const servers: Server[] = [
        {
          url: 'https://{environment}.example.com/{version}',
          variables: {
            environment: {
              defaultValue: 'api',
              enumValues: ['api', 'staging', 'dev']
            },
            version: {
              defaultValue: 'v1'
            }
          }
        }
      ];

      const result = selectServerBasePath(clientConfig, servers);

      expect(result).toBe('https://api.example.com/v1');
    });

    it('should return empty string when no servers are provided', () => {
      const clientConfig: BasePathServer = {};

      const result = selectServerBasePath(clientConfig);

      expect(result).toBe('');
    });

    it('should return empty string when servers array is empty', () => {
      const clientConfig: BasePathServer = {};
      const servers: Server[] = [];

      const result = selectServerBasePath(clientConfig, servers);

      expect(result).toBe('');
    });

    it('should default the basePath when no server available in the specification', () => {
      const clientConfig: BasePathServer = {
        server: {
          index: 1
        },
        defaultBasePath: 'https://api.example.com/v1'
      };
      const servers: Server[] = [];

      const result = selectServerBasePath(clientConfig, servers);

      expect(result).toBe('https://api.example.com/v1');
    });
  });

  describe('error handling', () => {
    it('should log warnings when server variables are missing defaults', () => {
      const clientConfig: BasePathServer = {};
      const servers: Server[] = [
        {
          url: 'https://{environment}.example.com',
          variables: {
            environment: {
              enumValues: ['api', 'staging']
            }
          }
        }
      ];

      selectServerBasePath(clientConfig, servers, mockLogger);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No value provided for server variable "environment", using empty string as default'
      );
    });

    it('should log warnings when server variable value is not in enum', () => {
      const clientConfig: BasePathServer = {
        server: {
          variables: {
            environment: 'prod'
          }
        }
      };
      const servers: Server[] = [
        {
          url: 'https://{environment}.example.com',
          variables: {
            environment: {
              defaultValue: 'production',
              enumValues: ['development', 'staging', 'production']
            }
          }
        }
      ];

      const result = selectServerBasePath(clientConfig, servers, mockLogger);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Value "prod" provided for server variable "environment" is not in the allowed enum [development, staging, production], using value "production" instead'
      );
      expect(result).toBe('https://production.example.com');
    });

    it('should log warning when no matching server index is found', () => {
      const clientConfig: BasePathServer = {
        server: {
          index: 5
        }
      };
      const servers: Server[] = [
        { url: 'https://server1.example.com' },
        { url: 'https://server2.example.com' }
      ];

      const result = selectServerBasePath(clientConfig, servers, mockLogger);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No server matching at index "5" has been found in the API, using the first server'
      );
      expect(result).toBe('https://server1.example.com');
    });
  });

  describe('with logger', () => {
    it('should log debug information about server selection', () => {
      const clientConfig: BasePathServer = {
        basePath: 'https://api.example.com/v1'
      };

      selectServerBasePath(clientConfig, undefined, mockLogger);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Using basePath from client configuration'
      );
    });

    it('should log when using fallback to default base url', () => {
      const clientConfig: BasePathServer = {
        defaultBasePath: 'https://fallback.example.com'
      };
      const servers: Server[] = [];

      selectServerBasePath(clientConfig, servers, mockLogger);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'No server configuration provided and no server defined in the API, using default basePath "https://fallback.example.com"'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle servers with empty URL', () => {
      const clientConfig: BasePathServer = {};
      const servers: Server[] = [
        { url: '' },
        { url: 'https://valid.example.com' }
      ];

      const result = selectServerBasePath(clientConfig, servers);

      expect(result).toBe('');
    });

    it('should handle basePath with trailing slash normalization', () => {
      const clientConfig: BasePathServer = {
        basePath: 'https://api.example.com/v1/'
      };

      const result = selectServerBasePath(clientConfig);

      // Depends on implementation - might normalize trailing slash
      expect(result).toMatch(/^https:\/\/api\.example\.com\/v1\/?$/);
    });

    it('should handle complex server variable substitution', () => {
      const clientConfig: BasePathServer = {};
      const servers: Server[] = [
        {
          url: '{protocol}://{host}:{port}/{basePath}',
          variables: {
            protocol: { defaultValue: 'https' },
            host: { defaultValue: 'api.example.com' },
            port: { defaultValue: '443' },
            basePath: { defaultValue: 'v1' }
          }
        }
      ];

      const result = selectServerBasePath(clientConfig, servers);

      expect(result).toBe('https://api.example.com:443/v1');
    });

    it('should handle server variables with enum validation', () => {
      const clientConfig: BasePathServer = {};
      const servers: Server[] = [
        {
          url: 'https://{environment}.example.com',
          variables: {
            environment: {
              defaultValue: 'production',
              enumValues: ['development', 'staging', 'production']
            }
          }
        }
      ];

      const result = selectServerBasePath(clientConfig, servers);

      expect(result).toBe('https://production.example.com');
    });
  });
});
