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
  createOutputFolder,
} from './core/helpers/create-output-folder';
import {
  getCollectionFileName,
  getStyleFileName,
} from './core/helpers/file-names';
import {
  getFile,
} from './core/requests/get-file.request';
import {
  getVariables,
  type VariablesOptions,
} from './core/requests/get-variable.request';
import {
  type FigmaFileContext,
} from './public_api';

interface GenerateJsonFile extends FigmaFileContext, VariablesOptions {
  /** Access Token with Variables read permission */
  accessToken: string;
  /** Folder where generating the Design Token */
  output: string;
}

const basePath = 'https://api.figma.com';

export const generateJsonFiles = async (options: GenerateJsonFile) => {
  const apiClient = new ApiFetchClient({
    basePath,
    requestPlugins: [new AdditionalParamsRequest({ headers: { 'X-Figma-Token': options.accessToken } })]
  });

  const variableResponse = getVariables(apiClient, { ...options, isPublished: false }) as Promise<GetLocalVariables200ResponseMeta>;
  const fileResponse = getFile(apiClient, options);

  const variableList = await variableResponse;
  const manifest = generateManifest(variableList, fileResponse);
  const textStyles = generateTextStyles(apiClient, fileResponse, variableList, options);
  const colorStyles = generateColorStyles(apiClient, fileResponse, variableList, options);
  const gridStyles = generateGridStyles(apiClient, fileResponse, variableList, options);
  const effectStyles = generateEffectStyles(apiClient, fileResponse, variableList, options);
  const tokensVariables = getTokensVariables(apiClient, fileResponse, variableList, options);
  await createOutputFolder(options.output, options);
  await Promise.all([
    writeFile(join(options.output, 'manifest.json'), JSON.stringify(await manifest, null, 2)),
    writeFile(join(options.output, getStyleFileName('TEXT')), JSON.stringify(await textStyles, null, 2)),
    writeFile(join(options.output, getStyleFileName('FILL')), JSON.stringify(await colorStyles, null, 2)),
    writeFile(join(options.output, getStyleFileName('GRID')), JSON.stringify(await gridStyles, null, 2)),
    writeFile(join(options.output, getStyleFileName('EFFECT')), JSON.stringify(await effectStyles, null, 2)),
    ...(await tokensVariables)
      .map((tokensVariable) => writeFile(join(options.output, getCollectionFileName(tokensVariable.collection, tokensVariable.mode)), JSON.stringify(tokensVariable.tokens, null, 2)))
  ]);
};
