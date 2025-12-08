import {
  dirname,
  posix,
  sep,
} from 'node:path';
import type {
  Context,
} from '../../context.mjs';
import {
  parseFile,
} from '../../core/file-system/parse-file.mjs';
import {
  generateModelNameRef,
  getMaskFileName,
} from '../generate-model-name.mjs';

/** Mask context */
export interface MaskContext extends Context {
  /** Path to the current file being parsed */
  filePath?: string;
  /** List of files already parsed */
  parsedFiles?: string[];
  /** List of model paths to be resolved for the current package */
  modelPaths: Record<string, string>;
  /** Package name */
  packageName: string;
}

const FIELD_SCHEMA_NAME = 'baseMaskField';

const FIELD_SCHEMA_REF = `#/definitions/${FIELD_SCHEMA_NAME}`;

/** Field schema definition */
export const FIELD_SCHEMA_DEFINITION = {
  [FIELD_SCHEMA_NAME]: {
    oneOf: [
      { type: 'boolean' },
      { const: {} },
      { const: null }
    ]
  }
};

export const JSON_SCHEMA_TYPE_MAPPING: Record<string, any> = {
  object: {}
};

/**
 * Generate a mask schema from a model definition
 * @param modelPath
 * @param ctx
 */
export const generateMaskSchemaModelAt = async (modelPath: string, ctx: MaskContext) => {
  const { logger } = ctx;

  modelPath = modelPath.replaceAll(sep, '/');
  if (ctx.filePath) {
    modelPath = posix.resolve(dirname(ctx.filePath).replaceAll(sep, '/'), modelPath);
  }

  if (ctx.parsedFiles?.includes(modelPath)) {
    logger?.warn(`The reference ${modelPath} is circular, it will be resolve to "any"`);
    return {};
  }

  const [filePath, innerPath] = modelPath.split('#/');
  let model = await parseFile<any>(filePath);

  if (ctx.filePath && ctx.modelPaths[filePath]) {
    const schemaInnerPath = innerPath?.replaceAll('/', '/properties/');

    return {
      description: model.description,
      oneOf: [
        {
          $ref: FIELD_SCHEMA_REF
        },
        {
          $ref: `./${getMaskFileName(generateModelNameRef(ctx.packageName, ctx.modelPaths[filePath]))}${schemaInnerPath ? `#/${schemaInnerPath}` : ''}`
        }
      ]
    };
  }

  if (!filePath && innerPath) {
    const schemaInnerPath = innerPath?.replaceAll('/', '/properties/');
    return {
      description: model.description,
      oneOf: [
        {
          $ref: FIELD_SCHEMA_REF
        },
        {
          $ref: schemaInnerPath ? `#/${schemaInnerPath}` : ''
        }
      ]
    };
  }

  if (innerPath) {
    model = innerPath.split('/').reduce((acc, pathItem) => acc?.[pathItem], model);
  }

  return generateMaskSchemaFromModel(model, {
    ...ctx,
    filePath,
    parsedFiles: [...(ctx.parsedFiles ?? []), modelPath]
  });
};

/**
 * Generate a mask schema from a model definition
 * @param model
 * @param ctx
 */
export const generateMaskSchemaFromModel = async (model: any, ctx: MaskContext): Promise<any> => {
  if (typeof model !== 'object' || !model) {
    return {
      default: model,
      oneOf: [
        { $ref: FIELD_SCHEMA_REF },
        ...(typeof model === 'object' ? [] : [{ type: typeof model }])
      ]
    };
  }

  if (Array.isArray(model)) {
    return {
      type: 'array',
      prefixItems: model
        .map((item) => generateMaskSchemaFromModel(item, ctx))
    };
  }

  if (model.$ref) {
    return generateMaskSchemaModelAt(model.$ref, ctx);
  } else if (model.type === 'object') {
    return {
      type: 'object',
      description: model.description,
      properties: {
        ...model.properties
          ? {
            properties: {
              type: 'object',
              properties: Object.fromEntries(
                await Promise.all(
                  Object.entries(model.properties).map(async ([key, value]) => ([key, await generateMaskSchemaFromModel(value, ctx)]))
                )
              )
            }
          }
          : {},
        ...Object.fromEntries(
          await Promise.all(
            Object.entries(model)
              .filter(([key]) => !['properties', 'type', '$ref'].includes(key))
              .map(async ([key, value]) => ([key, await generateMaskSchemaFromModel(value, ctx)]))
          )
        )
      }
    };
  }

  return {
    description: model.description,
    oneOf: [
      {
        $ref: FIELD_SCHEMA_REF
      },
      {
        type: model.type
      }
    ]
  };
};
