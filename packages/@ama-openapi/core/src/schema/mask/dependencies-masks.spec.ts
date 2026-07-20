import type {
  Context,
} from '../../context.mjs';
import {
  generateModelNameRef,
  getMaskFileName,
} from '../generate-model-name.mjs';
import {
  getDependencyModelMasks,
} from './dependencies-masks.mjs';
import {
  generateMaskSchemaModelAt,
} from './generate-mask-from-model.mjs';

jest.mock('../generate-model-name.mjs', () => ({
  generateModelNameRef: jest.fn(),
  getMaskFileName: jest.fn()
}));

jest.mock('./generate-mask-from-model.mjs', () => ({
  generateMaskSchemaModelAt: jest.fn()
}));

describe('getDependencyModelMasks', () => {
  const generateModelNameRefMock = generateModelNameRef as jest.MockedFunction<typeof generateModelNameRef>;
  const getMaskFileNameMock = getMaskFileName as jest.MockedFunction<typeof getMaskFileName>;
  const generateMaskSchemaModelAtMock = generateMaskSchemaModelAt as jest.MockedFunction<typeof generateMaskSchemaModelAt>;

  const baseContext: Context = {
    rootPath: '/root',
    workspacePath: '/workspace'
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should build masks for each model and flatten artifacts', async () => {
    const artifacts: any = [
      {
        packageManifest: { name: '@pkg/first' },
        baseDirectory: '/node_modules/@pkg/first',
        models: [
          { model: 'models/User.v1.yaml', modelPath: '/node_modules/@pkg/first/models/User.v1.yaml' },
          { model: 'models/Order.v1.yaml', modelPath: '/node_modules/@pkg/first/models/Order.v1.yaml' }
        ]
      },
      {
        packageManifest: { name: '@pkg/second' },
        baseDirectory: '/node_modules/@pkg/second',
        models: [
          { model: 'models/Item.v1.yaml', modelPath: '/node_modules/@pkg/second/models/Item.v1.yaml' }
        ]
      }
    ];

    generateModelNameRefMock
      .mockReturnValueOnce('FirstUser')
      .mockReturnValueOnce('FirstOrder')
      .mockReturnValueOnce('SecondItem');

    getMaskFileNameMock
      .mockReturnValueOnce('first-user.mask.json')
      .mockReturnValueOnce('first-order.mask.json')
      .mockReturnValueOnce('second-item.mask.json');

    generateMaskSchemaModelAtMock.mockResolvedValue({ type: 'object' });

    const result = await getDependencyModelMasks(artifacts, baseContext);

    expect(result).toHaveLength(3);

    result.forEach((entry) => {
      expect(entry).toHaveProperty('fileName');
      expect(entry).toHaveProperty('mask');
      expect(entry.mask).toMatchObject({
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: expect.any(Object)
      });
    });

    expect(generateModelNameRefMock).toHaveBeenCalledTimes(3);
    expect(getMaskFileNameMock).toHaveBeenCalledTimes(3);
    expect(generateMaskSchemaModelAtMock).toHaveBeenCalledTimes(3);
  });

  it('should filter out falsy model entries before processing', async () => {
    const artifacts: any = [
      {
        packageManifest: { name: '@pkg/only' },
        baseDirectory: '/node_modules/@pkg/only',
        models: [
          null,
          undefined,
          { model: 'models/Valid.v1.yaml', modelPath: '/node_modules/@pkg/only/models/Valid.v1.yaml' }
        ]
      }
    ];

    generateModelNameRefMock.mockReturnValue('OnlyValid');
    getMaskFileNameMock.mockReturnValue('only-valid.mask.json');
    generateMaskSchemaModelAtMock.mockResolvedValue({});

    const result = await getDependencyModelMasks(artifacts, baseContext);

    expect(result).toHaveLength(1);
    expect(generateModelNameRefMock).toHaveBeenCalledTimes(1);
    expect(getMaskFileNameMock).toHaveBeenCalledTimes(1);
    expect(generateMaskSchemaModelAtMock).toHaveBeenCalledTimes(1);
  });

  it('should derive package name from baseDirectory when manifest name is missing', async () => {
    const artifacts: any = [
      {
        packageManifest: {},
        baseDirectory: '/node_modules/@pkg/derived',
        models: [
          { model: 'models/Model.v1.yaml', modelPath: '/node_modules/@pkg/derived/models/Model.v1.yaml' }
        ]
      }
    ];

    generateModelNameRefMock.mockImplementation((pkgName) => `RefFrom-${pkgName}` as any);
    getMaskFileNameMock.mockReturnValue('derived.mask.json');
    generateMaskSchemaModelAtMock.mockResolvedValue({});

    const result = await getDependencyModelMasks(artifacts, baseContext);

    expect(result).toHaveLength(1);
    expect(generateModelNameRefMock).toHaveBeenCalledWith('derived', 'models/Model.v1.yaml');
  });

  it('should pass extended context including modelPaths and packageName to generateMaskSchemaModelAt', async () => {
    const modelPath = '/node_modules/@pkg/ctx/models/User.v1.yaml';
    const artifacts: any = [
      {
        packageManifest: { name: '@pkg/ctx' },
        baseDirectory: '/node_modules/@pkg/ctx',
        models: [
          { model: 'models/User.v1.yaml', modelPath }
        ]
      }
    ];

    generateModelNameRefMock.mockReturnValue('CtxUser');
    getMaskFileNameMock.mockReturnValue('ctx-user.mask.json');
    generateMaskSchemaModelAtMock.mockResolvedValue({});

    await getDependencyModelMasks(artifacts, baseContext);

    expect(generateMaskSchemaModelAtMock).toHaveBeenCalledTimes(1);
    const [, ctxArg] = generateMaskSchemaModelAtMock.mock.calls[0];

    expect(ctxArg).toMatchObject({
      ...baseContext,
      packageName: '@pkg/ctx'
    });
    expect(ctxArg.modelPaths).toEqual({
      [modelPath]: 'models/User.v1.yaml'
    });
  });
});
