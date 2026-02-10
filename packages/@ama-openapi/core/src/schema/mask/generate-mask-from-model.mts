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
import {
  FIELD_SCHEMA_REF,
} from './field-schema.constants.mjs';

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

/**
 * Generate a JSON Schema of a mask which can be applied to the provided model path
 * @param modelPath Path to the model
 * @param ctx Mask context
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

  // Convert model inner path to properties in the generated Mask schema
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
 * Recursive function to generate a JSON Schema of a mask which can be applied to the provided model object and its children
 * Note: this function is recursive and exported only for testing purposes
 * @access private
 * @param model Model object
 * @param ctx Mask context
 */
export const generateMaskSchemaFromModel = async (model: any, ctx: MaskContext): Promise<Record<string, any>> => {
  // Primitive types
  if (typeof model !== 'object' || !model) {
    return {
      default: model,
      oneOf: [
        { $ref: FIELD_SCHEMA_REF },
        ...(typeof model === 'object' ? [] : [{ type: typeof model }])
      ]
    };
  }

  // Arrays
  if (Array.isArray(model)) {
    return {
      type: 'array',
      prefixItems: await Promise.all(
        model.map((item) => generateMaskSchemaFromModel(item, ctx))
      )
    };
  }

  // Is referencing another model
  if (model.$ref) {
    return generateMaskSchemaModelAt(model.$ref, ctx);

  // Objects
  } else if (model.type === 'object') {
    return {
      type: 'object',
      ...(model.description === undefined ? {} : { description: model.description }),
      default: model.properties ? { properties: Object.fromEntries(Object.keys(model.properties).map((key) => [key, true])) } : {},
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
