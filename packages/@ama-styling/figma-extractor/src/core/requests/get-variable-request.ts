import type {
  ApiClient,
} from '@ama-sdk/core';
import {
  VariablesApi,
} from '@ama-styling/figma-sdk';
import type {
  FigmaFileContext,
} from '../interfaces';

/** Options to {@link getVariables} */
export interface VariablesOptions extends FigmaFileContext {
  /** Is it published variable (or file local ones) */
  isPublished?: boolean;
}

/**
 * Get the variables from a Figma file
 * @param apiClient SDK Api Client
 * @param options Options
 */
export const getVariables = async (apiClient: ApiClient, options: VariablesOptions) => {
  const variableApi = new VariablesApi(apiClient);

  options.logger?.debug?.('Initialize request to retrieve Figma file variables');
  const variables = options.isPublished
    ? variableApi.getPublishedVariables({ file_key: options.fileKey })
    : variableApi.getLocalVariables({ file_key: options.fileKey });
  const result = (await variables).meta;
  options.logger?.debug?.('Listed Figma file variable');

  return result;
};
