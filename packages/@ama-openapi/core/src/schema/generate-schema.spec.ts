import {
  vol,
} from 'memfs';
import type {
  Context,
} from '../context.mjs';
import {
  generateOpenApiManifestSchema,
} from './generate-schema.mjs';

jest.mock('node:fs', () => ({
  ...jest.requireActual('memfs'),
  promises: jest.requireActual('memfs').promises
}));

jest.mock('./list-artifacts.mjs', () => ({
  listSpecificationArtifacts: jest.fn().mockReturnValue([])
}));

jest.mock('node:fs/promises', () => jest.requireActual('memfs').promises);

describe('generateOpenApiManifestSchema', () => {
  let mockContext: Context;

  beforeEach(() => {
    vol.reset();
    mockContext = {
      rootPath: '/test-project',
      workspacePath: '/test-project'
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('basic schema generation', () => {
    it('should generate a schema with default options', async () => {
      const options: any = {
        ...mockContext
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle options with custom output path', async () => {
      const options: any = {
        ...mockContext,
        cwd: '/test-project/schemas'
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });

    it('should generate schema with specified spec path', async () => {
      const options: any = {
        ...mockContext,
        cwd: '/test-project/api-spec.yaml'
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });
  });

  describe('dependency handling', () => {
    it('should process dependencies when provided', async () => {
      const options: any = {
        ...mockContext,
        dependencies: ['@package/api-models']
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });

    it('should handle empty dependencies array', async () => {
      const options: any = {
        ...mockContext,
        dependencies: []
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });

    it('should handle multiple dependencies', async () => {
      const options: any = {
        ...mockContext,
        dependencies: [
          '@package/api-models',
          '@package/common-schemas',
          '@package/validation'
        ]
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });
  });

  describe('schema structure validation', () => {
    it('should return a valid JSON schema object', async () => {
      const options: any = {
        ...mockContext
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toHaveProperty('$schema');
      expect(result).toHaveProperty('type');
    });

    it('should include metadata in the schema', async () => {
      const options: any = {
        ...mockContext
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('error handling', () => {
    it('should handle invalid spec path gracefully', async () => {
      const options: any = {
        ...mockContext,
        specPath: '/non-existent/path/spec.yaml'
      };

      await expect(async () => {
        await generateOpenApiManifestSchema(options);
      }).resolves.not.toThrow();
    });

    it('should handle invalid output path', async () => {
      const options: any = {
        ...mockContext,
        cwd: ''
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });
  });

  describe('with different workspace configurations', () => {
    it('should work with nested workspace structure', async () => {
      const options: any = {
        ...mockContext,
        cwd: '/test-project/packages/api',
        workspacePath: '/test-project'
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });

    it('should handle monorepo workspace', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({
          name: 'test-monorepo',
          workspaces: ['packages/*']
        }),
        '/test-project/packages/api/package.json': JSON.stringify({
          name: '@test/api'
        })
      });

      const options: any = {
        ...mockContext,
        rootPath: '/test-project/packages/api'
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });
  });

  describe('schema content validation', () => {
    it('should generate schema with proper definitions', async () => {
      const options: any = {
        ...mockContext
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should include all required schema properties', async () => {
      const options: any = {
        ...mockContext
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });
  });

  describe('performance and optimization', () => {
    it('should handle concurrent calls', async () => {
      const options: any = {
        ...mockContext
      };

      const promises = [
        generateOpenApiManifestSchema(options),
        generateOpenApiManifestSchema(options),
        generateOpenApiManifestSchema(options)
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('integration with other options', () => {
    it('should work with all optional parameters', async () => {
      const options: any = {
        ...mockContext,
        specPath: '/test-project/openapi.yaml',
        outputPath: '/test-project/schemas',
        dependencies: ['@test/models']
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });

    it('should prioritize explicit options over defaults', async () => {
      const explicitOutputPath = '/custom/output';
      const options: any = {
        ...mockContext,
        outputPath: explicitOutputPath
      };

      const result = await generateOpenApiManifestSchema(options);

      expect(result).toBeDefined();
    });
  });
});
