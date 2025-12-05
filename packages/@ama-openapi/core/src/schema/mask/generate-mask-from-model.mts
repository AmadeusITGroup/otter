import {
  relative,
} from 'node:path';
import type {
  Context,
} from '../../context.mjs';
import {
  parseFile,
} from '../../core/file-system/parse-file.mjs';

export interface MaskContext extends Context {
  filePath?: string;
  parsedFiles?: Set<string>;

}

const fieldSchema = {
  oneOf: [
    { type: 'boolean' },
    { const: null }
  ]
};

export const generateMaskSchemaModelAt = async (modelPath: string, ctx: MaskContext) => {
  const { logger } = ctx;
  ctx.parsedFiles ||= new Set();

  if (ctx.filePath) {
    modelPath = relative(ctx.filePath, modelPath);
  }

  if (ctx.parsedFiles.has(modelPath)) {
    logger?.warn(`The reference ${modelPath} is circular, it will be resolve to "any"`);
    return {};
  }

  const [filePath, innerPath] = modelPath.split('#/');
  let model = await parseFile<any>(filePath);

  if (!innerPath) {
    model = innerPath.split('/').reduce((acc, pathItem) => acc[pathItem], model);
  }

  return generateMaskSchemaFromModel(model, {
    ...ctx,
    filePath
  });
};

/**
 * Generate a mask schema from a model definition
 * @param model
 * @param ctx
 */
export const generateMaskSchemaFromModel = async (model: any, ctx: MaskContext): Promise<any> => {
  if (typeof model !== 'object' || !model) {
    return fieldSchema;
  }

  if (Array.isArray(model)) {
    return {
      type: 'array',
      prefixItems: model
        .map((item) => generateMaskSchemaFromModel(item, ctx))
    };
  }

  if (model.type === 'object') {
    return {
      type: 'object',
      properties: {
        ...model.properties
          ? { properties: Object.fromEntries(Object.entries(model.properties).map(([key, value]) => ([key, generateMaskSchemaFromModel(value, ctx)]))) }
          : {},
        ...Object.fromEntries(
          Object.entries(model)
            .filter(([key]) => !['properties', 'type', '$ref'].includes(key))
            .map(([key, value]) => ([key, generateMaskSchemaFromModel(value, ctx)]))
        ),
        ...model.$ref ? await generateMaskSchemaModelAt(model.$ref, ctx) : {}
      }
    };
  }

  return fieldSchema;
};
