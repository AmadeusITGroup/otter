import {
  existsSync,
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import {
  Ajv,
} from 'ajv';
import {
  DEFAULT_MANIFEST_FILENAMES,
} from '../../constants.mjs';
import type {
  Logger,
} from '../../logger.mjs';
import {
  parseFile,
} from '../file-system/parse-file.mjs';

/**
 * Mask object for filtering properties
 */
export interface Mask {
  properties?: Record<string, any>;
  [x: string]: any;
}

export interface Transform {
  /** Mask to apply */
  mask?: Mask;
  /** Rename the model */
  titleRename?: string;
  /** Rename the outputted file (without extension) */
  fileRename?: string;
}

type TransformOrReference = Transform | string;

/**
 * Model definition within a dependency
 */
export interface Model {
  /** Path to the model in the artifact */
  path?: string;

  /**
   * Transforms to apply to the model
   * Note that for each transform object, a new definition will be generated
   */
  transform?: TransformOrReference;
}

/** List of supported types for an Model */
export type SupportedModelTypes = string | Model | boolean;

/** Models dependencies */
export type Models = Record<string, SupportedModelTypes | SupportedModelTypes[]>;

/** Manifest file structure */
export type Manifest = { models: Models };

/**
 * Validate the manifest file
 * @param manifest
 * @param manifestPath
 * @param logger
 */
const isValidManifest = async (manifest: any, manifestPath: string, logger?: Logger): Promise<boolean> => {
  if (!manifest || (typeof manifest === 'object' && !('models' in manifest))) {
    return false;
  }
  const schemaManifestPath = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', 'schemas', 'manifest.schema.json');
  const schemaTransformPath = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', 'schemas', 'transform.schema.json');
  const schemaManifest = JSON.parse(await fs.readFile(schemaManifestPath, { encoding: 'utf8' })) as object;
  const schemaTransform = JSON.parse(await fs.readFile(schemaTransformPath, { encoding: 'utf8' })) as object;
  const ajv = new Ajv();
  const validate = ajv.addSchema(schemaTransform).compile(schemaManifest);
  const isValid = validate(manifest);

  if (!isValid) {
    logger?.error(`${manifestPath} is invalid. Errors:`);
    logger?.error(validate.errors);
    throw new Error('Invalid Manifest');
  }

  return true;
};

/**
 * Retrieve Manifest file
 * @param workspaceDirectory
 * @param logger
 */
export const retrieveManifest = async (workspaceDirectory: string, logger?: Logger): Promise<Manifest | undefined> => {
  for (const manifestFileName of DEFAULT_MANIFEST_FILENAMES) {
    const manifestPath = resolve(workspaceDirectory, manifestFileName);
    if (!existsSync(manifestPath)) {
      logger?.debug?.(`Manifest file not found at ${manifestPath}`);
      continue;
    }

    const manifest = await parseFile<Manifest>(manifestPath);
    if (await isValidManifest(manifest, manifestPath, logger)) {
      logger?.info?.(`Manifest file found at ${manifestPath}`);
      return manifest;
    } else {
      logger?.debug?.(`Manifest file at ${manifestPath} is not conform to the expected schema`);
    }
  }
  return undefined;
};
