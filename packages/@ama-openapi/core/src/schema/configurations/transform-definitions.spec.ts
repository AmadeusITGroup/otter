import {
  generateModelNameRef,
  getMaskFileName,
} from '../generate-model-name.mjs';
import {
  getTransformDefinitions,
} from './transform-definitions.mjs';

jest.mock('../generate-model-name.mjs', () => ({
  generateModelNameRef: jest.fn(),
  getMaskFileName: jest.fn()
}));

describe('getTransformDefinitions', () => {
  const generateModelNameRefMock =
    generateModelNameRef as jest.MockedFunction<typeof generateModelNameRef>;
  const getMaskFileNameMock =
    getMaskFileName as jest.MockedFunction<typeof getMaskFileName>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should generate transform definitions for each valid model using helpers', () => {
    generateModelNameRefMock.mockReturnValue('pkg-model-ref');
    getMaskFileNameMock.mockReturnValue('mask-pkg-model-ref.json');

    const artifacts: any[] = [
      {
        packageManifest: {
          name: '@scope/api'
        },
        baseDirectory: '/node_modules/@scope/api',
        models: [
          { model: 'models/Example.v1.yaml' },
          null
        ]
      }
    ];

    const result = getTransformDefinitions(artifacts as any);

    expect(generateModelNameRefMock).toHaveBeenCalledWith('@scope/api', 'models/Example.v1.yaml');
    expect(getMaskFileNameMock).toHaveBeenCalledWith('pkg-model-ref');

    expect(Object.keys(result)).toEqual(['transform-pkg-model-ref']);

    const definition = result['transform-pkg-model-ref'];

    expect(definition).toBeDefined();
    expect(definition.allOf).toHaveLength(2);
    expect(definition.allOf[0]).toEqual({
      $ref: '#/definitions/baseTransform'
    });
    expect(definition.allOf[1]).toEqual({
      type: 'object',
      properties: {
        mask: {
          $ref: './mask-pkg-model-ref.json'
        }
      }
    });
  });

  it('should fallback to base directory name when package manifest name is missing', () => {
    generateModelNameRefMock.mockReturnValue('pkg-from-basename');
    getMaskFileNameMock.mockReturnValue('mask-from-basename.json');

    const artifacts: any[] = [
      {
        packageManifest: {
          name: ''
        },
        baseDirectory: '/packages/my-api',
        models: [
          { model: 'models/Other.yaml' }
        ]
      }
    ];

    const result = getTransformDefinitions(artifacts as any);

    expect(generateModelNameRefMock).toHaveBeenCalledWith('my-api', 'models/Other.yaml');
    expect(result['transform-pkg-from-basename']).toBeDefined();
  });
});
