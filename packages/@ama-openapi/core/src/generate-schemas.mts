import {
  existsSync,
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import * as process from 'node:process';
import {
  DEFAULT_SCHEMA_OUTPUT_DIRECTORY,
  MANIFEST_SCHEMA_FILE,
} from './constants.mjs';
import type {
  Context,
} from './context.mjs';
import type {
  Logger,
} from './logger.mjs';
import {
  generateOpenApiManifestSchema,
  type GenerateOpenApiManifestSchemaOptions,
} from './schema/generate-schema.mjs';

/** Options for Generate Validation Schemas */
export interface GenerateValidationSchemasOptions extends GenerateOpenApiManifestSchemaOptions {
  /** Logger */
  logger?: Logger;
  /** Output directory */
  outputDirectory?: string;
}

/**
 * Generate the JSON Schema providing help on the OpenAPI Manifest
 * @param cwd
 * @param options
 */
export const generateValidationSchemaFiles = async (cwd = process.cwd(), options?: GenerateValidationSchemasOptions) => {
  const outputDirectory = options?.outputDirectory ?? DEFAULT_SCHEMA_OUTPUT_DIRECTORY;
  const opts = {
    ...options,
    cwd
  } as const satisfies Context;
  const directory = resolve(cwd, outputDirectory);
  const manifestSchemaObj = await generateOpenApiManifestSchema(opts);

  if (!existsSync(directory)) {
    await fs.mkdir(directory, { recursive: true });
  }
  await fs.writeFile(resolve(outputDirectory, MANIFEST_SCHEMA_FILE), JSON.stringify(manifestSchemaObj), { encoding: 'utf8' });
};
