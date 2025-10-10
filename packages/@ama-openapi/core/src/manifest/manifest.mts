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
export interface Mask {
  properties?: Record<string, any>;
}

/** Reference mapping */
export interface ReferenceMapping {
  /** Pattern to match in the reference path */
  pattern: string;

  /** Destination path relative to define relative to the manifest file */
  destination: string;

  /** Determine if the matching pattern should be kept */
  keepMatchingString?: boolean;
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

  /**
   * Map a reference path pattern to a relative path pointing the specified path in workspace
   */
  referenceMapping?: ReferenceMapping[]
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

/**
 * Map a reference path pattern to a relative path pointing the specified path in workspace
 */
  referenceMapping?: ReferenceMapping[]
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

  /**
 * Map a reference path pattern to a relative path pointing the specified path in workspace
 */
  referenceMapping?: ReferenceMapping[]
}

const DEFAULT_MANIFEST_FILENAME = 'manifest';
const DEFAULT_REGISTRY = 'https://registry.npmjs.org/';

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

const resolveReferenceMapping = (currentDirectory: string, referenceMapping?: ReferenceMapping[]): ReferenceMapping[] | undefined => {
  return referenceMapping && referenceMapping.map((mapping) => ({ ...mapping, destination: resolve(currentDirectory, mapping.destination) }));
};

/**
 * Validate the manifest file
 * @param manifest
 * @param logger
 */
const validateManifest = async (manifest: Manifest, filePath: string, logger: Logger) => {
  const ajv = new Ajv();
  const schemaPath = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'schemas', 'manifest.schema.json');
  const schema = JSON.parse(await fs.readFile(schemaPath, { encoding: 'utf8' }));
  const validate = ajv.compile(schema);
  const isValid = validate(manifest);

  if (!isValid) {
    logger.error(`${filePath} is invalid. Errors:`);
    logger.error(validate.errors);
    throw new Error(`Invalid manifest`);
  }

  const invalidVersions = manifest.dependencies
    ?.filter(isDependencyArtifact)
    ?.filter(({ version }) => valid(version));
  if (invalidVersions?.length) {
    logger.error(`${filePath} contains invalid versions:`);
    invalidVersions.forEach(({ artifact, version }) => logger.error(`version "${version}" for the artifact "${artifact}" is invalid`));
    throw new Error(`Invalid dependency version`);
  }
};

export interface RetrieveManifestOptions {
  /** Determine if an exception should be raised if no manifest file has been found */
  failOnMissingManifest?: boolean;

  /**
   * Manifest filename without extension, default on {@link MANIFEST_FILENAME}
   * @default 'manifest'
   */
  manifestFilename?: string;
}

/**
 * Retrieve Manifest file
 * @param currentDirectory
 * @param logger
 */
export const retrieveManifest = async (currentDirectory: string, logger: Logger = console, options?: RetrieveManifestOptions): Promise<Manifest | undefined> => {
  const { manifestFilename = DEFAULT_MANIFEST_FILENAME } = options || {};
  const jsonFilePaths = [resolve(currentDirectory, `${manifestFilename}.json`)];
  const yamlFilePaths = [resolve(currentDirectory, `${manifestFilename}.yaml`), resolve(currentDirectory, `${manifestFilename}.yml`)];
  let manifest: Manifest | undefined;


  const yamlFilePath = yamlFilePaths.find(existsSync);
  const jsonFilePath = jsonFilePaths.find(existsSync);
  if (jsonFilePath) {
    logger.info(`Use the ${manifestFilename} file at ${jsonFilePath}`);
    manifest = JSON.parse(await fs.readFile(jsonFilePath, { encoding: 'utf8' }));
  } else if (yamlFilePath) {
    logger.info(`Use the ${manifestFilename} file at ${yamlFilePath}`);
    manifest = load(await fs.readFile(yamlFilePath, { encoding: 'utf8' }), {}) as Manifest;
  }

  if (!manifest) {
    if (!options?.failOnMissingManifest) {
      return ;
    }
    logger.error(`Missing file "${manifestFilename}.json" and "${manifestFilename}.yaml"`);
    throw new Error('Missing manifest');
  }

  await validateManifest(manifest, (jsonFilePath || yamlFilePath)!, logger);

  manifest.registry ||= DEFAULT_REGISTRY;
  manifest.dependencyOutput = resolve(currentDirectory, manifest.dependencyOutput || './oas_external');
  manifest.referenceMapping = resolveReferenceMapping(currentDirectory, manifest.referenceMapping);

  manifest.dependencies
    ?.filter(isDependencyArtifact)
    .forEach((dep) => {
      dep.registry ||= manifest.registry;
      dep.name ||= dep.artifact;
      dep.models.forEach((model) => {
        model.referenceMapping = resolveReferenceMapping(currentDirectory, model.referenceMapping);
        model.referenceMapping ||= manifest.referenceMapping;
        model.name ||= basename(model.source).replace(/\.(?:json|ya?ml)]$/i, '');
      });
    });

  manifest.dependencies
    ?.filter(isDependencyLink)
    .forEach((dep) => {
      dep.referenceMapping = resolveReferenceMapping(currentDirectory, dep.referenceMapping);
      dep.referenceMapping ||= manifest.referenceMapping;
    });

  return manifest;
};
