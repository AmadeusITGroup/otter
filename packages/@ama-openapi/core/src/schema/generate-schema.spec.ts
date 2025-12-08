import type {
  Context,
} from '../context.mjs';
import {
  generateModelNameRef,
  getMaskFileName,
} from './generate-model-name.mjs';
import type {
  GenerateOpenApiManifestSchemaOptions,
} from './generate-schema.mjs';
import {
  generateOpenApiManifestSchema,
} from './generate-schema.mjs';
import {
  listSpecificationArtifacts,
} from './list-artifacts.mjs';
import {
  generateMaskSchemaModelAt,
} from './mask/generate-mask-from-model.mjs';

jest.mock('./list-artifacts.mjs', () => ({
  listSpecificationArtifacts: jest.fn()
}));

jest.mock('./generate-model-name.mjs', () => ({
  generateModelNameRef: jest.fn(),
  getMaskFileName: jest.fn()
}));

jest.mock('./mask/generate-mask-from-model.mjs', () => ({
  FIELD_SCHEMA_DEFINITION: { mockedField: true },
  generateMaskSchemaModelAt: jest.fn()
}));

const createBaseOptions = (
  overrides: Partial<GenerateOpenApiManifestSchemaOptions & Context> = {}
): GenerateOpenApiManifestSchemaOptions & Context => ({
  cwd: '/tmp/project',
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  } as any,
  ...overrides
} as any);

describe('generateOpenApiManifestSchema', () => {
  const listSpecificationArtifactsMock =
    listSpecificationArtifacts as jest.MockedFunction<typeof listSpecificationArtifacts>;
  const generateModelNameRefMock =
    generateModelNameRef as jest.MockedFunction<typeof generateModelNameRef>;
  const getMaskFileNameMock =
    getMaskFileName as jest.MockedFunction<typeof getMaskFileName>;
  const generateMaskSchemaModelAtMock =
    generateMaskSchemaModelAt as jest.MockedFunction<typeof generateMaskSchemaModelAt>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return empty models and masks when there are no artifacts or models', async () => {
    listSpecificationArtifactsMock.mockResolvedValueOnce([]);

    const options = createBaseOptions();
    const result = await generateOpenApiManifestSchema(options);

    expect(listSpecificationArtifactsMock).toHaveBeenCalledWith(options);

    expect(result.masks).toEqual([]);

    expect(result.manifest.properties?.models?.properties).toEqual({});
    expect(result.manifest.definitions).toEqual({
      baseTransform: expect.any(Object)
    });
  });

  it('should build manifest properties, definitions and masks from artifacts', async () => {
    const options = createBaseOptions();

    const artifacts = [
      {
        packageManifest: {
          name: 'test-artifact',
          main: 'index.js'
        },
        baseDirectory: '/node_modules/test-artifact',
        models: [
          {
            model: 'models/user.json',
            modelPath: '/abs/path/models/user.json'
          }
        ]
      }
    ];

    listSpecificationArtifactsMock.mockResolvedValueOnce(artifacts as any);

    generateModelNameRefMock.mockImplementation((artifactName, modelPath) => {
      if (artifactName === 'test-artifact' && modelPath === 'models/user.json') {
        return 'TestArtifact-user';
      }
      if (artifactName === 'test-artifact' && modelPath === '/abs/path/models/user.json') {
        return 'TestArtifact-user-abs';
      }
      return 'Unknown';
    });

    getMaskFileNameMock.mockImplementation((modelNameRef) => {
      return `mask-${modelNameRef}.json`;
    });

    generateMaskSchemaModelAtMock.mockResolvedValue({
      type: 'object',
      properties: {
        foo: { type: 'string' }
      }
    } as any);

    const result = await generateOpenApiManifestSchema(options);

    expect(listSpecificationArtifactsMock).toHaveBeenCalledWith(options);

    expect(generateModelNameRefMock).toHaveBeenCalledWith(
      'test-artifact',
      'models/user.json'
    );

    const modelsProps = result.manifest.properties?.models?.properties;
    expect(Object.keys(modelsProps)).toEqual(['test-artifact']);

    const artifactProp = modelsProps['test-artifact'];
    expect(artifactProp.oneOf).toHaveLength(2);
    expect(artifactProp.oneOf[0]).toEqual({
      $ref: '#/definitions/model-TestArtifact-user'
    });
    expect(artifactProp.oneOf[1]).toEqual({
      type: 'array',
      items: {
        oneOf: [
          { $ref: '#/definitions/model-TestArtifact-user' }
        ]
      }
    });

    const definitions = result.manifest.definitions as any;

    expect(definitions.baseTransform).toEqual(
      expect.objectContaining({
        type: 'object',
        properties: {
          rename: expect.any(Object)
        }
      })
    );

    expect(definitions['model-TestArtifact-user']).toEqual({
      oneOf: [
        {
          type: 'boolean',
          default: true,
          description: 'Include the default model exposed by the artifact'
        },
        {
          const: 'models/user.json'
        },
        {
          type: 'object',
          description: 'Detailed model inclusion with optional transformations to apply',
          properties: {
            path: {
              const: 'models/user.json',
              description:
                "Path to the specific model to include as is. The path is relative to the artifact root (e.g., 'models/ExampleModel.v1.yaml')"
            },
            transform: {
              $ref: '#/definitions/transform-TestArtifact-user'
            }
          },
          required: ['path'],
          additionalProperties: false
        }
      ]
    });

    expect(definitions['transform-TestArtifact-user']).toEqual({
      allOf: [
        { $ref: '#/definitions/baseTransform' },
        {
          type: 'object',
          properties: {
            mask: {
              $ref: './mask-TestArtifact-user.json'
            }
          }
        }
      ]
    });

    expect(generateMaskSchemaModelAtMock).toHaveBeenCalledTimes(1);
    expect(generateMaskSchemaModelAtMock).toHaveBeenCalledWith(
      '/abs/path/models/user.json',
      expect.objectContaining({
        packageName: 'test-artifact',
        modelPaths: {
          '/abs/path/models/user.json': 'models/user.json'
        }
      })
    );

    expect(result.masks).toHaveLength(1);
    const maskEntry = result.masks[0];

    expect(maskEntry.fileName).toBe('mask-TestArtifact-user.json');

    expect(maskEntry.mask).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'OpenApi specification mask TestArtifact-user',
      $id: '@ama-openapi/core/schemas/mask-TestArtifact-user.json',
      type: 'object',
      properties: {
        foo: { type: 'string' }
      },
      definitions: {
        mockedField: true
      }
    });
  });
});
