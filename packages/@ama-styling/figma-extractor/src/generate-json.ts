import {
  writeFile,
} from 'node:fs/promises';
import {
  join,
} from 'node:path';
import {
  ApiFetchClient,
} from '@ama-sdk/client-fetch';
import {
  AdditionalParamsRequest,
} from '@ama-sdk/core';
import type {
  GetLocalVariables200ResponseMeta,
} from '@ama-styling/figma-sdk';
import {
  generateManifest,
} from './core/generators/generate-manifest';
import {
  generatePackage,
} from './core/generators/generate-package';
import {
  getTokensVariables,
} from './core/generators/generate-tokens';
import {
  generateColorStyles,
} from './core/generators/styles/generate-color';
import {
  generateEffectStyles,
} from './core/generators/styles/generate-effect';
import {
  generateGridStyles,
} from './core/generators/styles/generate-grid';
import {
  generateTextStyles,
} from './core/generators/styles/generate-text';
import {
  isFigmaFileContext,
  isFigmaProjectContext,
} from './core/helpers/context-helpers';
import {
  createOutputFolder,
} from './core/helpers/create-output-folder';
import {
  getCollectionFileName,
  getStyleFileName,
} from './core/helpers/file-names';
import type {
  ExtractorContext,
  FigmaFileContext,
  FigmaProjectContext,
} from './core/interfaces';
import {
  getFile,
} from './core/requests/get-file-request';
import {
  getVariables,
} from './core/requests/get-variable-request';
import {
  getAllVersions,
  getFileVersions,
  type VersionWithFileKey,
} from './core/requests/get-versions-request';

interface GenerateJsonFile extends ExtractorContext, Partial<FigmaFileContext>, Partial<FigmaProjectContext> {
  /** Access Token with Variables read permission */
  accessToken: string;
  /** Folder where generating the Design Token */
  output: string;
  /** Name of the Design Token collection */
  name?: string;
  /** Name of the NPM Package. The field {@link GenerateJsonFile.name} will be used if not provided */
  packageName?: string;
  /** Request the generation of the NPM Package */
  generatePackage?: boolean;
  /** Range to filter the versions */
  versionRange?: string;
}

const BASE_PATH = 'https://api.figma.com';
const MANIFEST_FILE = 'manifest.json';
const DEFAULT_NAME = 'Design Tokens';
const DEFAULT_VERSION = '0.0.0';

/**
 * Generate the JSON files part of the Design Token specification
 * @param options
 */
export const generateJsonFiles = async (options: GenerateJsonFile) => {
  const basePath = BASE_PATH;
  const manifestFile = MANIFEST_FILE;
  const apiClient = new ApiFetchClient({
    basePath,
    requestPlugins: [new AdditionalParamsRequest({ headers: { 'X-Figma-Token': options.accessToken } })]
  });

  // load version and determine the Figma file to target in Project support mode
  let versions: Promise<VersionWithFileKey[]>;
  if (isFigmaFileContext(options)) {
    versions = getFileVersions(apiClient, options);
  } else if (isFigmaProjectContext(options)) {
    versions = getAllVersions(apiClient, options as FigmaProjectContext);
    options.fileKey = (await versions).at(0)?.fileKey;

    if (!isFigmaFileContext(options)) {
      throw new Error('Fail to determine the Figma File base on the given Figma Project');
    }
  } else {
    throw new Error('Fail to determine the Figma File to extract the data from The token Generation will stop');
  }

  const variableResponse = getVariables(apiClient, { ...options, isPublished: false }) as Promise<GetLocalVariables200ResponseMeta>;
  const fileResponse = getFile(apiClient, options);
  const npmPackageName = options.packageName || options.name || DEFAULT_NAME;

  const manifest = generateManifest(variableResponse, fileResponse, { name: DEFAULT_NAME, ...options });
  const textStyles = generateTextStyles(apiClient, fileResponse, variableResponse, options);
  const colorStyles = generateColorStyles(apiClient, fileResponse, variableResponse, options);
  const gridStyles = generateGridStyles(apiClient, fileResponse, variableResponse, options);
  const effectStyles = generateEffectStyles(apiClient, fileResponse, variableResponse, options);
  const tokensVariables = getTokensVariables(apiClient, fileResponse, variableResponse, options);
  await createOutputFolder(options.output, options);
  await Promise.all([
    (async () => {
      if (options.generatePackage) {
        return writeFile(
          join(options.output, 'package.json'),
          JSON.stringify(await generatePackage({ manifestFile, name: npmPackageName, version: (await versions).at(0)?.label || DEFAULT_VERSION }), null, 2)
        );
      }
    })(),
    (async () => writeFile(join(options.output, manifestFile), JSON.stringify(await manifest, null, 2)))(),
    (async () => writeFile(join(options.output, getStyleFileName('TEXT')), JSON.stringify(await textStyles, null, 2)))(),
    (async () => writeFile(join(options.output, getStyleFileName('FILL')), JSON.stringify(await colorStyles, null, 2)))(),
    (async () => writeFile(join(options.output, getStyleFileName('GRID')), JSON.stringify(await gridStyles, null, 2)))(),
    (async () => writeFile(join(options.output, getStyleFileName('EFFECT')), JSON.stringify(await effectStyles, null, 2)))(),
    ...(await tokensVariables)
      .map((tokensVariable) => writeFile(join(options.output, getCollectionFileName(tokensVariable.collection, tokensVariable.mode)), JSON.stringify(tokensVariable.tokens, null, 2)))
  ]);
};
