import {
  promises as fs,
} from 'node:fs';
import {
  createRequire,
} from 'node:module';
import {
  basename,
  dirname,
  extname,
  join,
  resolve,
} from 'node:path';
import {
  load,
} from 'js-yaml';
import type {
  PackageJson,
} from 'type-fest';
import {
  OUTPUT_DIRECTORY,
} from '../../constants.mjs';
import type {
  Logger,
} from '../../logger.mjs';
import {
  isJsonFile,
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
  model: Model & { path: string };
  /** Indicates if the model file is a JSON file */
  isJson: boolean;
  /** Absolute path to the artifact root folder */
  artifactBasePath: string;
  /** Absolute path to the output for the generated file */
  outputFilePath: string;
  /** Mask to apply */
  transform?: Transform;
}

const require = createRequire(import.meta.url);

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
    const fileContent = await fs.readFile(transformPath, { encoding: 'utf8' });
    return extname(transformPath).toLowerCase() === '.json'
      ? JSON.parse(fileContent) as Transform
      : load(fileContent) as Transform;
  }

  return transform;
};

/**
 * Extract dependency model given simple model definition (as string or boolean)
 * @param cwd
 * @param artifactName
 * @param modelName
 */
const extractDependencyModelsSimple = async (cwd: string, artifactName: string, modelName: string | boolean): Promise<RetrievedDependencyModel> => {
  const artifactPackageJson = require.resolve(`${artifactName}/package.json`);
  const artifactBasePath = dirname(artifactPackageJson);
  const modelPath = typeof modelName === 'string' ? join(artifactBasePath, modelName) : require.resolve(artifactName);
  const version = await fs.readFile(artifactPackageJson, { encoding: 'utf8' }).then((data) => (JSON.parse(data) as PackageJson).version || 'latest');
  const content = await fs.readFile(modelPath, { encoding: 'utf8' });
  const path = typeof modelName === 'string' ? modelName : artifactName;
  const model = { path } satisfies Model;
  const outputFilePath = resolve(cwd, OUTPUT_DIRECTORY, sanitizePackagePath(artifactName), model.path);
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
    isJson: isJsonFile(modelPath)
  };
};

/**
 * Extract dependency model given full model definition
 * @param cwd
 * @param artifactName
 * @param model
 * @param transformPromise
 */
const extractDependencyModelsObject = async (cwd: string, artifactName: string, model: Model, transformPromise: Promise<Transform | undefined>): Promise<RetrievedDependencyModel> => {
  const transform = await transformPromise;
  const artifactPackageJson = require.resolve(`${artifactName}/package.json`);
  const artifactBasePath = dirname(artifactPackageJson);
  const modelPath = model.path ? join(artifactBasePath, model.path) : require.resolve(artifactName);
  const version = await fs.readFile(artifactPackageJson, { encoding: 'utf8' }).then((data) => (JSON.parse(data) as PackageJson).version || 'latest');
  const content = await fs.readFile(modelPath, { encoding: 'utf8' });

  const defaultSpec = require.resolve(artifactName).split(artifactName)[1];
  const path = model.path || defaultSpec;
  const fileExtension = extname(path);
  const replaceName = transform?.fileRename && path.replace(new RegExp(`(${basename(path, fileExtension)})${fileExtension}$`), transform.fileRename + fileExtension);
  const fileNameOutput = replaceName || path;
  const outputFilePath = resolve(cwd, OUTPUT_DIRECTORY, sanitizePackagePath(artifactName), fileNameOutput);
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
    isJson: isJsonFile(modelPath)
  };
};

/**
 * Extract dependency models from the manifest
 * @param cwd
 * @param manifest
 * @param _logger
 */
export const extractDependencyModels = (cwd: string, manifest: Manifest, _logger?: Logger) => {
  return Object.entries(manifest.models).flatMap(([dependencyName, modelDefinition]) => {
    const models = Array.isArray(modelDefinition) ? modelDefinition : [modelDefinition];
    return models
      .flatMap((model) => typeof model === 'string' || typeof model === 'boolean'
        ? [extractDependencyModelsSimple(cwd, dependencyName, model)]
        : (Array.isArray(model.transform)
          ? (model.transform.length > 0 ? model.transform : [undefined]).map((transform) => extractDependencyModelsObject(cwd, dependencyName, model, retrieveTransform(cwd, transform)))
          : [extractDependencyModelsObject(cwd, dependencyName, model, retrieveTransform(cwd, model.transform))]));
  });
};
