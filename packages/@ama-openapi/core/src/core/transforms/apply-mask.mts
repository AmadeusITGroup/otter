import {
  existsSync,
  promises as fs,
} from 'node:fs';
import {
  basename,
  dirname,
  posix,
  relative,
  resolve,
  sep,
} from 'node:path';
import {
  GENERATED_REF_PROPERTY_KEY,
  SUB_MASK_DIRECTORY,
} from '../../constants.mjs';
import type {
  Context,
} from '../../context.mjs';
import {
  isRelativePath,
} from '../file-system/relative-path.mjs';
import {
  extractDependencyModelsObject,
  type RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';
import type {
  Model,
} from '../manifest/manifest.mjs';
import type {
  SpecificationFile,
} from './transform.mjs';

type ReferenceSpecification = { $ref: string; [x: string]: any };

/**
 * Determine the sub-mask file name for a given $ref and parent keys
 * @param ref
 * @param parents
 */
const determineSubMaskFileName = (ref: string, parents: string[]): string =>
  `${parents.map((parent) => parent.charAt(0).toLocaleUpperCase() + parent.substring(1)).join('')}_${basename(ref)}`;

/**
 * Determine the sub-mask path for a given retrieved model and mask file name
 * @param retrievedModel
 */
const determineSubMaskPath = (retrievedModel: RetrievedDependencyModel): string => {
  return resolve(
    dirname(retrievedModel.outputFilePath),
    SUB_MASK_DIRECTORY,
    basename(retrievedModel.outputFilePath).replace(/\.[^.]+$/, '')
  );
};

const splitArtifactModelPaths = async (modelPath: string, context: Context): Promise<{ artifactName: string; path: string }> => {
  const { logger } = context;
  let projectRoot = modelPath;
  let artifactName = '';
  while (!artifactName && projectRoot !== dirname(projectRoot)) {
    projectRoot = dirname(projectRoot);
    const packageJsonPath = resolve(projectRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      artifactName = JSON.parse(await fs.readFile(packageJsonPath, { encoding: 'utf8' })).name;
      logger?.debug?.(`Found artifact named ${artifactName} for ${modelPath} sub reference`);
    }
  }
  return {
    artifactName,
    path: relative(projectRoot, modelPath)
  };
};

/**
 * Create the function to apply mask to a given model
 * @param retrievedModel
 * @param context
 */
const createMaskApplier = (retrievedModel: RetrievedDependencyModel, context: Context) => {
  const { logger } = context;

  /**
   * Handle a $ref in the specification during mask application when the mask needs to be applied to the referenced model
   * @param node
   * @param mask
   * @param parents
   */
  const handleReference = async <T extends ReferenceSpecification>(node: T, mask: any, parents: string[]): Promise<T> => {
    if (!isRelativePath(node.$ref)) {
      logger?.debug?.(`Skipping $ref "${node.$ref}" from mask application as it is not a relative path`);
      return node;
    }
    if (node.$ref.startsWith('#')) {
      logger?.debug?.(`Skipping $ref "${node.$ref}" from mask application as it is local reference`);
      return node;
    }

    const modelPath = resolve(dirname(retrievedModel.modelPath), node.$ref);
    const maskFileName = determineSubMaskFileName(node.$ref, parents);
    const outputFileDirectory = determineSubMaskPath(retrievedModel);
    const transform = {
      rename: maskFileName,
      mask
    };

    const { artifactName, path } = await splitArtifactModelPaths(modelPath, context);
    const model = {
      path,
      transform
    } satisfies Model;

    const extractedModel = await extractDependencyModelsObject(artifactName, model, Promise.resolve(transform), context, outputFileDirectory);
    const { processModel } = await import('../process.mjs');
    await Promise.all(processModel([Promise.resolve(extractedModel)], context));

    return {
      ...node,
      $ref: relative(dirname(retrievedModel.outputFilePath), extractedModel.outputFilePath).replaceAll(sep, posix.sep),
      [GENERATED_REF_PROPERTY_KEY]: true
    };
  };

  /**
   * Apply the property field mask to the specification
   * @param node
   * @param mask
   * @param parents
   */
  const applyPropertyFieldMask = async (node: any, mask: any, parents: string[]): Promise<any> => {
    if (node === null || node === undefined) {
      return node;
    }
    if (typeof mask !== 'object') {
      return node;
    }
    if (typeof node !== 'object') {
      return undefined;
    }
    return Object.fromEntries(
      await Promise.all(
        Object.entries(mask)
          .filter(([key]) => key in node)
          .map(async ([key, subMask]) => ([key, await applySubMask(node[key], subMask, [...parents, key])]))
      )
    );
  };

  /**
   * Recursively apply the sub-mask to the specification
   * @param node
   * @param mask
   * @param parents
   */
  const applySubMask = async (node: any, mask: any, parents: string[]): Promise<any> => {
    if (node === null || node === undefined) {
      return node;
    }

    if (typeof node !== 'object') {
      return typeof mask === 'object' ? node : mask;
    } else if (Array.isArray(node)) {
      if (Array.isArray(mask)) {
        return (await Promise.all(
          node
            .map((item, index) => applySubMask(item, mask[index] ?? {}, parents))
        )).filter((item) => item !== undefined);
      }
    } else {
      if ('$ref' in node && typeof node.$ref === 'string' && mask && typeof mask === 'object' && 'properties' in mask) {
        return handleReference(node, mask, parents);
      }
      return mask && typeof mask === 'object'
        ? {
          ...node,
          ...Object.fromEntries(
            await Promise.all(
              Object.entries(mask)
                .filter(([key]) => key in node)
                .map(async ([key, subMask]) => {
                  const newParents = [...parents, key];
                  return [
                    key,
                    key === 'properties'
                      ? await applyPropertyFieldMask(node[key], subMask, parents)
                      : await applySubMask(node[key], subMask, newParents)
                  ];
                })
            )
          )
        }
        : (mask || mask === null ? node : undefined);
    }
  };

  return applySubMask;
};

/**
 * Apply the mask to the model
 * @param specification
 * @param retrievedModel
 * @param context
 */
export const applyMask = <S extends SpecificationFile>(specification: S, retrievedModel: RetrievedDependencyModel, context: Context): S | Promise<S> => {
  const { logger } = context;
  if (!retrievedModel.transform || !retrievedModel.transform.mask) {
    logger?.debug?.(`No mask found for model from ${retrievedModel.artifactName} at ${retrievedModel.model.path}, skipping mask application`);
    return specification;
  }

  const maskApplier = createMaskApplier(retrievedModel, context);
  return maskApplier(specification, retrievedModel.transform.mask, []) as Promise<S>;
};
