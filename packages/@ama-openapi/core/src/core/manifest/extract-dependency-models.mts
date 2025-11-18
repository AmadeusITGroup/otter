import {
  promises as fs,
} from 'node:fs';
import {
  createRequire,
} from 'node:module';
import {
  basename,
  dirname,
  join,
  resolve,
} from 'node:path';
import type {
  PackageJson,
} from 'type-fest';
import {
  OUTPUT_DIRECTORY,
} from '../../constants.mjs';
import type {
  Context,
} from '../../context.mjs';
import type {
  Logger,
} from '../../logger.mjs';
import {
  isJsonFile,
  parseFile,
} from '../file-system/parse-file.mjs';
import type {
  Manifest,
  Model,
  Transform,
} from './manifest.mjs';

/**
 * Extracted dependency model information
 */
export interface RetrievedDependencyModel {
  /** Name of the artifact */
  artifactName: string;
  /** Version of the artifact */
  version: string;
  /** Absolute path to the model file */
  modelPath: string;
  /** Content of the model file */
  content: string;
  /** Model definition from the manifest */
  model: Model & Required<Pick<Model, 'path'>>;
  /** Indicates if the input model file is a JSON file */
  isInputJson: boolean;
  /** Indicates if the output model file is a JSON file */
  isOutputJson: boolean;
  /** Absolute path to the artifact root folder */
  artifactBasePath: string;
  /** Absolute path to the output for the generated file */
  outputFilePath: string;
  /** Mask to apply */
  transform?: Transform;
}

/**
 * Sanitize the package path to be used in file system
 * @param artifactName
 */
const sanitizePackagePath = (artifactName: string) => {
  return artifactName
    .replace('/', '-')
    .replace(/^@/, '');
};

/**
 * Retrieve the transform object from the manifest
 * @param cwd
 * @param transform
 */
const retrieveTransform = async (cwd: string, transform?: Transform | string): Promise<Transform | undefined> => {
  if (typeof transform === 'string') {
    const transformPath = resolve(cwd, transform);
    return parseFile<Transform>(transformPath);
  }

  return transform;
};

/**
 * Get information for artifactory manifest file
 * @param require
 * @param artifactName
 */
const getArtifactInfo = async (require: NodeJS.Require, artifactName: string) => {
  const artifactPackageJson = require.resolve(`${artifactName}/package.json`);
  const artifactBasePath = dirname(artifactPackageJson);
  const packageJsonContent = await fs.readFile(artifactPackageJson, { encoding: 'utf8' });
  const version: string = (JSON.parse(packageJsonContent) as PackageJson).version || 'latest';
  return { artifactBasePath, version };
};

/**
 * Extract dependency model given simple model definition (as string or boolean)
 * @param cwd
 * @param artifactName
 * @param modelName
 * @param logger
 * @param outputDirectory
 */
const extractDependencyModelsSimple = async (
  cwd: string,
  artifactName: string,
  modelName: string | boolean,
  logger?: Logger,
  outputDirectory = OUTPUT_DIRECTORY): Promise<RetrievedDependencyModel> => {
  logger?.debug?.(`extracting model ${modelName} from ${outputDirectory}`);
  const require = createRequire(resolve(cwd, 'package.json'));
  const { artifactBasePath, version } = await getArtifactInfo(require, artifactName);
  const modelPath = typeof modelName === 'string' ? join(artifactBasePath, modelName) : require.resolve(artifactName);
  const content = await fs.readFile(modelPath, { encoding: 'utf8' });
  const path = typeof modelName === 'string' ? modelName : artifactName;
  const model = { path } satisfies Model;
  const outputFilePath = resolve(cwd, outputDirectory, sanitizePackagePath(artifactName), model.path);
  return {
    outputFilePath,
    artifactBasePath,
    artifactName,
    modelPath,
    version,
    content,
    model: {
      path
    },
    isInputJson: isJsonFile(modelPath),
    isOutputJson: isJsonFile(outputFilePath)
  };
};

/**
 * Extract dependency model given full model definition
 * @param artifactName
 * @param model
 * @param transformPromise
 * @param context
 * @param outputDirectory
 */
export const extractDependencyModelsObject = async (
  artifactName: string,
  model: Model,
  transformPromise: Promise<Transform | undefined>,
  context: Context,
  outputDirectory = OUTPUT_DIRECTORY): Promise<RetrievedDependencyModel> => {
  const { cwd, logger } = context;
  const require = createRequire(resolve(cwd, 'package.json'));
  const transform = await transformPromise;
  const { artifactBasePath, version } = await getArtifactInfo(require, artifactName);
  const modelPath = model.path ? join(artifactBasePath, model.path) : require.resolve(artifactName);
  const content = await fs.readFile(modelPath, { encoding: 'utf8' });
  logger?.debug?.(`extracting model ${modelPath} from ${outputDirectory}`);

  const path = model.path || require.resolve(artifactName).split(artifactName)[1];
  const fileNameOutput = transform?.rename ? path.replace(new RegExp(`(${basename(path).replaceAll('.', '\\.')})$`), transform.rename) : path;
  const outputFilePath = resolve(cwd, outputDirectory, sanitizePackagePath(artifactName), fileNameOutput);
  return {
    transform,
    outputFilePath,
    artifactBasePath,
    artifactName,
    modelPath,
    version,
    content,
    model: {
      ...model,
      path
    },
    isInputJson: isJsonFile(modelPath),
    isOutputJson: isJsonFile(outputFilePath)
  };
};

/**
 * Extract dependency models from the manifest
 * @param manifest
 * @param context
 */
export const extractDependencyModels = (manifest: Manifest, context: Context) => {
  const { logger, cwd } = context;
  logger?.info(`${Object.keys(manifest.models).length} dependencies models found in the manifest`);
  logger?.debug?.('Extracting information from the manifest configuration: ', manifest);
  return Object.entries(manifest.models).flatMap(([dependencyName, modelDefinition]) =>
    (Array.isArray(modelDefinition) ? modelDefinition : [modelDefinition])
      .map((model) => (typeof model === 'string' || typeof model === 'boolean')
        ? extractDependencyModelsSimple(cwd, dependencyName, model, logger)
        : extractDependencyModelsObject(dependencyName, model, retrieveTransform(cwd, model.transform), context))
  );
};
