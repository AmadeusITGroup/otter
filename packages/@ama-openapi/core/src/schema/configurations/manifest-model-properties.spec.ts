import {
  getManifestModelsProperties,
} from './manifest-model-properties.mjs';

const createArtifact = (overrides: Partial<any> = {}) => ({
  packageManifest: {
    name: '@test/api',
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

describe('getManifestModelsProperties', () => {
  it('should generate oneOf refs and array variant for package with models', () => {
    const artifacts = [createArtifact()];

    const result = getManifestModelsProperties(artifacts as any);

    expect(result['@test/api']).toBeDefined();
    expect(result['@test/api'].oneOf).toBeDefined();
    expect(result['@test/api'].oneOf).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $ref: expect.stringContaining('#/definitions/model-test-api-')
        }),
        expect.objectContaining({
          type: 'array',
          items: expect.objectContaining({
            oneOf: expect.arrayContaining([
              expect.objectContaining({
                $ref: expect.stringContaining('#/definitions/model-test-api-')
              })
            ])
          })
        })
      ])
    );
  });

  it('should use basename of baseDirectory when package name is missing', () => {
    const artifacts = [
      createArtifact({
        packageManifest: { name: '' },
        baseDirectory: '/node_modules/custom-api'
      })
    ];

    const result = getManifestModelsProperties(artifacts as any);

    expect(result['custom-api']).toBeDefined();
  });

  it('should skip artifacts without models', () => {
    const artifacts = [
      {
        packageManifest: { name: '@empty/api' },
        baseDirectory: '/node_modules/@empty/api',
        models: []
      }
    ] as any;

    const result = getManifestModelsProperties(artifacts);

    expect(result).toEqual({});
  });
});
