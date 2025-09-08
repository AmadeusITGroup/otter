import type {
  ApiClient,
} from '@ama-sdk/core';
import {
  FilesApi,
  type GetFile200Response,
} from '@ama-styling/figma-sdk';
import type {
  FigmaFileContext,
} from '../interfaces';

/** Options to {@link getTextWeightVariableIds} */
export interface TextWeightVariablesOptions extends FigmaFileContext {
}

/**
 * Get the variables used in text weight where they should be considered as unit-less
 * @param apiClient SDK Api Client
 * @param figmaFile Figma information
 * @param options Options
 */
export const getTextWeightVariableIds = async (apiClient: ApiClient, figmaFile: Promise<GetFile200Response>, options: TextWeightVariablesOptions) => {
  const filesApi = new FilesApi(apiClient);
  const styles = (await figmaFile).styles;
  const ids = Object.entries(styles)
    .filter(([, { styleType }]) => styleType === 'TEXT')
    .map(([id]) => id)
    .join(',');

  options.logger?.debug?.('Initialize request to Style Text variables information');
  const variableIds = Object.entries((await filesApi.getFileNodes({ file_key: options.fileKey, ids })).nodes)
    .filter(([, node]) => node.document.type === 'TEXT')
    .map(([, node]) => node.document.boundVariables?.fontWeight)
    .map((weight) => weight
      ?.filter((w) => w.type === 'VARIABLE_ALIAS')
      .map((w) => w.id))
    .filter((varIds): varIds is string[] => !!varIds)
    .flat();
  options.logger?.debug?.('Listed Style Text variables IDs');

  return variableIds;
};
