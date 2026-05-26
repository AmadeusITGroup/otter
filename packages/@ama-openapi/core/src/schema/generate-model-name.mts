import {
  sanitizePackagePath,
} from '../core/manifest/extract-dependency-models.mjs';

/**
 * Generate a reference name from a model definition
 * @param artifactName
 * @param modelPath
 */
export const generateModelNameRef = (artifactName: string, modelPath: string): string => {
  const sanitizedArtifactName = sanitizePackagePath(artifactName);
  const [filePath, innerPath] = modelPath.split('#/');
  const modelName = (filePath.replace(/\.(json|ya?ml)$/, '') + (innerPath ?? ''))
    .replace(/^\.+\//, '')
    .replace(/-/g, '_')
    .replace(/\//g, '-');
  return `${sanitizedArtifactName}-${modelName}`;
};

/**
 * Generate a mask schema file name from a model definition
 * @param modelNameRef
 */
export const getMaskFileName = (modelNameRef: string) => {
  return `mask-${modelNameRef}.json`;
};
