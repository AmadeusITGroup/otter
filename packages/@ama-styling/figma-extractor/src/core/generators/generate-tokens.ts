import type {
  ApiClient,
} from '@ama-sdk/core';
import type {
  GetFile200Response,
  GetLocalVariables200ResponseMeta,
} from '@ama-styling/figma-sdk';
import type {
  FigmaFileContext,
} from '../interfaces';
import {
  getTextWeightVariableIds,
} from '../requests/get-text-weight.request';
import {
  getTokensFromLocalVariables,
} from './tokens/token-from-local-variables';

interface GroupedVariable {
  collection: string;
  mode: { modeId: string; name: string };
  tokens: any;
}

/** Options to {@link getTokensFromLocalVariables} */
export interface TokenVariablesOptions extends FigmaFileContext {
  /** Default unit to apply to number when not excluded */
  defaultUnit?: string;
}

/**
 * Get the list of tokens regrouped by Mode and Collection
 * @param apiClient Api Client
 * @param figmaFile Figma file description
 * @param variableList List of variables
 * @param options Options
 */
export const getTokensVariables = async (
  apiClient: ApiClient,
  figmaFile: Promise<GetFile200Response>,
  variableList: GetLocalVariables200ResponseMeta,
  options: TokenVariablesOptions
) => {
  const textWeightVariableIds = await getTextWeightVariableIds(apiClient, figmaFile, options);

  return Object.values(variableList.variableCollections).reduce((acc, collection) => {
    collection.modes.forEach((mode) => {
      const tokenFile = {
        collection: collection.name,
        mode,
        tokens: getTokensFromLocalVariables(variableList, textWeightVariableIds, { ...options, modeId: mode.modeId, collectionId: collection.id })
      };
      if (Object.keys(tokenFile.tokens).length > 0) {
        acc.push(tokenFile);
      }
    });
    return acc;
  }, [] as GroupedVariable[]);
};
