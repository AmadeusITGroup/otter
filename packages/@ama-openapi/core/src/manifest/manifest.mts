import {
  existsSync,
  promises as fs,
} from 'node:fs';
import {
  basename,
  resolve,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import {
  Ajv,
} from 'ajv';
import {
  load,
} from 'js-yaml';
import {
  valid,
} from 'semver';
import type {
  Logger,
} from '../logger.mjs';

/**
 * Mask object for filtering properties
 */
interface Mask {
  properties?: Record<string, any>;
}

/**
 * Model definition within a dependency
 */
export interface Model {
  /**
   * Name of the definition model as used in the specification
   */
  name: string;

  /**
   * Model path in the dependency artifact
   */
  source: string;

  /**
   * Mask for filtering model properties
   */
  mask?: Mask;
}

/**
 * Dependency artifact specification
 */
export interface DependencyArtifact {
  /**
   * Name of the definition as used in the specification
   */
  name?: string;

  /**
   * Name of the artifact of the registry
   */
  artifact: string;

  /**
   * Version of the specification
   */
  version: string;

  /**
   * List of the models to be referable in the current specification
   */
  models: Model[];

  /**
   * Registry URL for the dependency
   */
  registry?: string;
}

/**
 * Dependency link specification
 */
export interface DependencyLink {
  /**
   * Name of the definition as used in the specification
   */
  name: string;

  /**
   * Link of the registry model
   */
  link: string;

  /**
   * Mask for filtering model properties
   */
  mask?: Mask;
}

/**
 * Options for downloading dependency models
 */
export type Dependency = DependencyArtifact | DependencyLink;

/**
 * OpenApi specification package manifest
 * Main manifest interface representing the complete structure
 */
export interface Manifest {
  /**
   * Name of the current OpenAPI collection
   */
  name?: string;

  /**
   * Folder where download the dependency models
   * @default ./oas_external
   */
  dependencyOutput: string;

  /**
   * Default Registry URL
   */
  registry?: string;

  /**
   * List of dependencies for the OpenAPI specification
   */
  dependencies?: Dependency[];
}

/** Manifest file name */
export const MANIFEST_FILENAME = 'manifest';

/**
 * Check if the object is {@link DependencyLink}
 * @param obj
 */
export const isDependencyLink = (obj: any): obj is DependencyLink => obj && typeof obj === 'object' && obj.link;
/**
 * Check if the object is {@link DependencyArtifact}
 * @param obj
 */
export const isDependencyArtifact = (obj: any): obj is DependencyArtifact => obj && typeof obj === 'object' && obj.version && Array.isArray(obj.models);

/**
 * Validate the manifest file
 * @param manifest
 * @param logger
 */
const validateManifest = async (manifest: Manifest, logger: Logger) => {
  const ajv = new Ajv();
  const schemaPath = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'manifest.schema.json');
  const schema = JSON.parse(await fs.readFile(schemaPath, { encoding: 'utf8' }));
  const validate = ajv.compile(schema);
  const isValid = validate(manifest);

  if (!isValid) {
    logger.error(`${MANIFEST_FILENAME} is invalid. Errors:`);
    logger.error(validate.errors);
    throw new Error(`Invalid manifest`);
  }

  const invalidVersions = manifest.dependencies
    ?.filter(isDependencyArtifact)
    ?.filter(({ version }) => valid(version));
  if (invalidVersions?.length) {
    logger.error(`${MANIFEST_FILENAME} contains invalid versions:`);
    invalidVersions.forEach(({ artifact, version }) => logger.error(`version "${version}" for the artifact "${artifact}" is invalid`));
    throw new Error(`Invalid dependency version`);
  }
};

/**
 * Retrieve Manifest file
 * @param currentDirectory
 * @param logger
 */
export const retrieveManifest = async (currentDirectory: string, logger: Logger = console): Promise<Manifest> => {
  const jsonFilePath = resolve(currentDirectory, `${MANIFEST_FILENAME}.json`);
  const yamlFilePath = resolve(currentDirectory, `${MANIFEST_FILENAME}.yaml`);
  let manifest: Manifest | undefined;

  if (existsSync(jsonFilePath)) {
    logger.info(`Use the ${MANIFEST_FILENAME} file ${jsonFilePath}`);
    manifest = JSON.parse(await fs.readFile(jsonFilePath, { encoding: 'utf8' }));
  } else if (existsSync(yamlFilePath)) {
    logger.info(`Use the ${MANIFEST_FILENAME} file ${yamlFilePath}`);
    manifest = load(await fs.readFile(yamlFilePath, { encoding: 'utf8' }), {}) as Manifest;
  }

  if (!manifest) {
    logger.error(`Missing file "${MANIFEST_FILENAME}.json" and "${MANIFEST_FILENAME}.yaml"`);
    throw new Error('Missing manifest');
  }

  await validateManifest(manifest, logger);

  manifest.registry ||= 'https://registry.npmjs.org/';
  manifest.dependencyOutput = resolve(currentDirectory, manifest.dependencyOutput || './oas_external');

  manifest.dependencies
    ?.filter(isDependencyArtifact)
    .forEach((dep) => {
      dep.registry ||= manifest.registry;
      dep.name ||= dep.artifact;
      dep.models.forEach((model) => {
        model.name ||= basename(model.source).replace(/\.(?:json|ya?ml)]$/i, '');
      });
    });

  return manifest;
};
