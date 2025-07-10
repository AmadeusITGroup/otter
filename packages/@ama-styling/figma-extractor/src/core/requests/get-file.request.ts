import type {
  ApiClient,
} from '@ama-sdk/core';
import {
  FilesApi,
} from '@ama-styling/figma-sdk';
import type {
  FigmaFileContext,
} from '../interfaces';

/** Options to {@link getFile} */
export interface FileOptions extends FigmaFileContext {
}

/**
 * Get the Figma file information
 * @param apiClient SDK Api Client
 * @param options Options
 */
export const getFile = async (apiClient: ApiClient, options: FileOptions) => {
  const filesApi = new FilesApi(apiClient);
  options.logger?.debug?.('Initialize request to retrieve Figma file information');
  const file = await filesApi.getFile({ file_key: options.fileKey });
  options.logger?.debug?.('Retrieved Figma file information');
  return file;
};
