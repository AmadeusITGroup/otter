import path from 'node:path';
import type { Spec } from 'swagger-schema-official';

/**
 * Determine if a reference is targeting outside from the current swagger spec
 * @param refPath Reference path
 */
export function isOuterRefPath(refPath: string) {
  return !(refPath.startsWith('#'));
}

/**
 * Determine if a reference is targeting an URL
 * @param refPath Reference path
 */
export function isUrlRefPath(refPath: string) {
  return (/^https?:\/\//.test(refPath));
}

/**
 * Get the Full Path for a YAML file
 * @param sourcePath Path to the YAML file to target
 * @param relativeSourcePath Relative Path to the targeted YAML file
 */
export function getYamlFullPath(sourcePath: string, relativeSourcePath: string) {
  if (isUrlRefPath(relativeSourcePath)) {
    return relativeSourcePath;
  }
  if (/ya?ml$/i.test(relativeSourcePath)) {
    return path.resolve(path.dirname(sourcePath), relativeSourcePath);
  }

  const artifactPath = require.resolve(relativeSourcePath);
  return artifactPath;
}

/**
 * Convert a StopLight Definition into a valid swagger
 * @param spec Specification file loaded
 */
export function sanitizeDefinition(spec: any): Spec | undefined {
  if (!spec) {
    return undefined;
  }

  if (spec.swagger) {
    // this is probable a swagger file
    return spec;
  }

  if (spec.title && spec.type) {
    // this is probable a StopLight definition file that need to be wrapped
    return {
      swagger: '2.0',
      info: {
        title: `${spec.title as string} definition generated from StopLight definition file`,
        version: spec.version || '0.0.0'
      },
      paths: {},
      definitions: {
        [spec.title]: spec
      }
    };
  }

  throw new Error('Unknown definition type');
}
