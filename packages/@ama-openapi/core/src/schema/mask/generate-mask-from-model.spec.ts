import {
  join,
  posix,
} from 'node:path';
import {
  parseFile,
} from '../../core/file-system/parse-file.mjs';
import {
  generateModelNameRef,
  getMaskFileName,
} from '../generate-model-name.mjs';
import type {
  MaskContext,
} from './generate-mask-from-model.mjs';
import {
  generateMaskSchemaFromModel,
  generateMaskSchemaModelAt,
} from './generate-mask-from-model.mjs';

jest.mock('../../core/file-system/parse-file.mjs', () => ({
  parseFile: jest.fn()
}));

jest.mock('../generate-model-name.mjs', () => ({
  generateModelNameRef: jest.fn(),
  getMaskFileName: jest.fn()
}));

const FIELD_SCHEMA_REF = '#/definitions/baseMaskField';

const createBaseCtx = (overrides: Partial<MaskContext> = {}): MaskContext => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  } as any,
  modelPaths: {},
  packageName: 'test-package',
  ...overrides
} as any);

describe('generateMaskSchemaModelAt', () => {
  const parseFileMock = parseFile as jest.MockedFunction<typeof parseFile>;
  const generateModelNameRefMock =
    generateModelNameRef as jest.MockedFunction<typeof generateModelNameRef>;
  const getMaskFileNameMock =
    getMaskFileName as jest.MockedFunction<typeof getMaskFileName>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should resolve circular references using parsedFiles and log a warning', async () => {
    const modelPath = '/models/user.json';
    const ctx = createBaseCtx({
      parsedFiles: [modelPath]
    });

    const result = await generateMaskSchemaModelAt(modelPath, ctx);

    expect(ctx.logger?.warn).toHaveBeenCalledWith(
      `The reference ${modelPath} is circular, it will be resolve to "any"`
    );
    expect(result).toEqual({});
    expect(parseFileMock).not.toHaveBeenCalled();
  });

  it('should resolve modelPath relative to ctx.filePath', async () => {
    const ctxFilePath = join('root', 'schemas', 'root.json');
    const relativeModelPath = './models/user.json';
    const expectedResolved = posix.resolve('root/schemas', relativeModelPath);

    parseFileMock.mockResolvedValueOnce({
      description: 'User model'
    });

    const ctx = createBaseCtx({
      filePath: ctxFilePath,
      modelPaths: {}
    });

    await generateMaskSchemaModelAt(relativeModelPath, ctx);

    expect(parseFileMock).toHaveBeenCalledWith(expectedResolved);
  });

  it('should build a mask $ref when modelPaths has an entry for the filePath', async () => {
    const filePath = '/root/schemas/user.json';
    const modelPath = `${filePath}#/User`;
    const description = 'User model';

    parseFileMock.mockResolvedValueOnce({ description });

    const ctx = createBaseCtx({
      filePath: '/root/schemas/root.json',
      packageName: 'my-pkg',
      modelPaths: {
        [filePath]: 'models/user.ts'
      }
    });

    generateModelNameRefMock.mockReturnValue('MyPkgUser');
    getMaskFileNameMock.mockReturnValue('my-pkg-user.mask.json');

    const result = await generateMaskSchemaModelAt(modelPath, ctx);

    const expectedInnerPath = 'User';
    const expectedRef = `./my-pkg-user.mask.json#/${expectedInnerPath}`;

    expect(result).toEqual({
      description,
      oneOf: [
        { $ref: FIELD_SCHEMA_REF },
        { $ref: expectedRef }
      ]
    });

    expect(generateModelNameRefMock).toHaveBeenCalledWith(
      'my-pkg',
      'models/user.ts'
    );
    expect(getMaskFileNameMock).toHaveBeenCalledWith('MyPkgUser');
  });

  it('should handle innerPath-only references (no filePath)', async () => {
    const modelPath = '#/User/details';
    const description = 'Inline root schema';

    // filePath is empty string here, but we still mock parseFile.
    parseFileMock.mockResolvedValueOnce({ description });

    const ctx = createBaseCtx({
      filePath: undefined,
      modelPaths: {}
    });

    const result = await generateMaskSchemaModelAt(modelPath, ctx);

    expect(result).toEqual({
      description,
      oneOf: [
        { $ref: FIELD_SCHEMA_REF },
        {
          $ref: '#/User/properties/details'
        }
      ]
    });
  });

  it('should drill down into model using innerPath when no modelPaths entry is present', async () => {
    const filePath = '/root/schemas/user.json';
    const modelPath = `${filePath}#/components/schemas/User`;
    const model = {
      components: {
        schemas: {
          User: {
            type: 'string',
            description: 'User id'
          }
        }
      }
    };

    parseFileMock.mockResolvedValueOnce(model);

    const ctx = createBaseCtx({
      filePath: '/root/schemas/root.json',
      modelPaths: {} // no entry for filePath to hit the fallback branch
    });

    const result = await generateMaskSchemaModelAt(modelPath, ctx);

    // It should eventually wrap the leaf model as a mask schema.
    expect(result).toEqual({
      description: 'User id',
      oneOf: [
        { $ref: FIELD_SCHEMA_REF },
        { type: 'string' }
      ]
    });
  });
});

describe('generateMaskSchemaFromModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return FIELD_SCHEMA_REF for non-object or null model', async () => {
    const ctx = createBaseCtx();

    const resString = await generateMaskSchemaFromModel('foo' as any, ctx);
    const resNumber = await generateMaskSchemaFromModel(123 as any, ctx);
    const resNull = await generateMaskSchemaFromModel(null as any, ctx);

    expect(resString).toEqual({
      oneOf: [
        {
          $ref: FIELD_SCHEMA_REF
        },
        {
          type: 'string'
        }
      ], default: 'foo' });
    expect(resNumber).toEqual({
      oneOf: [
        {
          $ref: FIELD_SCHEMA_REF
        },
        {
          type: 'number'
        }
      ], default: 123
    });
    expect(resNull).toEqual({
      default: null,
      oneOf: [
        {
          $ref: FIELD_SCHEMA_REF
        }
      ]
    });
  });

  it('should return array schema with prefixItems as promises for array model', async () => {
    const ctx = createBaseCtx();
    const model = [
      { type: 'string', description: 'name' },
      { type: 'number', description: 'age' }
    ];

    const result = await generateMaskSchemaFromModel(model as any, ctx);

    expect(result.type).toBe('array');
    expect(Array.isArray(result.prefixItems)).toBe(true);
    expect(result.prefixItems).toEqual([
      {
        description: 'name',
        oneOf: [
          { $ref: FIELD_SCHEMA_REF },
          { type: 'string' }
        ]
      },
      {
        description: 'age',
        oneOf: [
          { $ref: FIELD_SCHEMA_REF },
          { type: 'number' }
        ]
      }
    ]);
  });

  it('should build object schema for type "object" with nested properties and non-property fields', async () => {
    const ctx = createBaseCtx();
    const model = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          description: 'Foo field'
        }
      },
      extra: {
        type: 'number',
        description: 'Extra field'
      }
    };

    const result = await generateMaskSchemaFromModel(model as any, ctx);

    expect(result).toEqual({
      type: 'object',
      default: {
        properties: {
          foo: true
        }
      },
      properties: {
        properties: {
          type: 'object',
          properties: {
            foo: {
              description: 'Foo field',
              oneOf: [
                { $ref: FIELD_SCHEMA_REF },
                { type: 'string' }
              ]
            }
          }
        },
        extra: {
          description: 'Extra field',
          oneOf: [
            { $ref: FIELD_SCHEMA_REF },
            { type: 'number' }
          ]
        }
      }
    });
  });

  it('should return mask schema for leaf model without $ref or type object', async () => {
    const ctx = createBaseCtx();
    const model = {
      type: 'string',
      description: 'Simple string'
    };

    const result = await generateMaskSchemaFromModel(model as any, ctx);

    expect(result).toEqual({
      description: 'Simple string',
      oneOf: [
        { $ref: FIELD_SCHEMA_REF },
        { type: 'string' }
      ]
    });
  });
});
