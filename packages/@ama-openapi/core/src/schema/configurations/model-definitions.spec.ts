import {
  getModelDefinitions,
} from './model-definitions.mjs';

const createArtifact = (overrides: Partial<any> = {}) => ({
  packageManifest: {
    name: '@test/api',
    main: 'index.js',
    ...overrides.packageManifest
  },
  baseDirectory: '/node_modules/@test/api',
  models: [
    {
      model: 'models/Example.v1.yaml'
    }
  ],
  ...overrides
});

describe('getModelDefinitions', () => {
  it('should generate model definition entries with proper refs', () => {
    const artifacts = [createArtifact()];

    const result = getModelDefinitions(artifacts as any);

    const keys = Object.keys(result);
    expect(keys).toHaveLength(1);
    const key = keys[0];
    expect(key).toMatch(/^model-test-api-/);

    const definition = result[key];
    expect(definition.oneOf).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'boolean',
          default: true,
          description: 'Include the default model exposed by the artifact'
        }),
        expect.objectContaining({
          const: 'models/Example.v1.yaml'
        }),
        expect.objectContaining({
          type: 'object',
          properties: expect.objectContaining({
            path: expect.objectContaining({
              const: 'models/Example.v1.yaml'
            }),
            transform: expect.objectContaining({
              $ref: expect.stringContaining('#/definitions/transform-test-api-')
            })
          })
        })
      ])
    );
  });

  it('should use basename of baseDirectory when package name is missing', () => {
    const artifacts = [
      createArtifact({
        packageManifest: { name: '', main: 'index.js' },
        baseDirectory: '/node_modules/custom-api'
      })
    ];

    const result = getModelDefinitions(artifacts as any);

    const keys = Object.keys(result);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toMatch(/^model-custom-api-/);
  });

  it('should not include boolean option when package main is not defined', () => {
    const artifacts = [
      createArtifact({
        packageManifest: { name: '@test/api' }
      })
    ];

    const result = getModelDefinitions(artifacts as any);

    const keys = Object.keys(result);
    const definition = result[keys[0]];

    const booleanEntries = (definition.oneOf as any[]).filter((entry) => entry.type === 'boolean');
    expect(booleanEntries).toHaveLength(0);
  });

  it('should skip null or undefined model entries', () => {
    const artifacts = [
      createArtifact({
        models: [
          { model: 'models/Example.v1.yaml' },
          null,
          undefined
        ] as any
      })
    ];

    const result = getModelDefinitions(artifacts as any);

    const keys = Object.keys(result);
    expect(keys).toHaveLength(1);
  });

  it('should return empty object when no artifacts have models', () => {
    const artifacts = [
      {
        packageManifest: { name: '@empty/api' },
        baseDirectory: '/node_modules/@empty/api',
        models: []
      }
    ] as any;

    const result = getModelDefinitions(artifacts);

    expect(result).toEqual({});
  });
});
