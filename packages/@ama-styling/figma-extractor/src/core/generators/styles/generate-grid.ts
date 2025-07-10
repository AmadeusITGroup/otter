import type {
  ApiClient,
} from '@ama-sdk/core';
import {
  FilesApi,
  type FrameNode,
  type GetFile200Response,
  type GetLocalVariables200ResponseMeta,
} from '@ama-styling/figma-sdk';
import {
  getRgbaColorHex,
} from '../../helpers/color-hex.helpers';
import type {
  FigmaFileContext,
} from '../../interfaces';

interface Grid {
  pattern: string;
  visible: boolean;
  alignment: string;
  color: string;
  gutterSize: string;
  count: number;
  offset: string;
}

/** Options to {@link generateGridStyles} */
export interface GridStylesOptions extends FigmaFileContext {
  /** Default unit to apply to number when not excluded */
  defaultUnit?: string;
}

/**
 * Generate grid style tokens
 * @param apiClient Api Client
 * @param figmaFile Figma File information
 * @param _localVariablesResponse list of file variables
 * @param options Options
 */
export const generateGridStyles = async (
  apiClient: ApiClient,
  figmaFile: Promise<GetFile200Response>,
  _localVariablesResponse: GetLocalVariables200ResponseMeta,
  options: GridStylesOptions
) => {
  const filesApi = new FilesApi(apiClient);
  const styles = (await figmaFile).styles;
  const ids = Object.entries(styles)
    .filter(([, { styleType, remote }]) => styleType === 'GRID' && !remote)
    .map(([id]) => id)
    .join(',');
  const nodes = (await filesApi.getFileNodes({ file_key: options.fileKey, ids })).nodes;
  const ret = Object.values(nodes)
    .filter(({ document }) => !!(document as FrameNode).layoutGrids)
    .reduce((acc, { document }) => {
      const value = (document as FrameNode).layoutGrids
        ?.map((layoutGrid): Grid => ({
          pattern: layoutGrid.pattern.toLowerCase(),
          visible: layoutGrid.visible,
          alignment: layoutGrid.alignment.toLowerCase(),
          color: getRgbaColorHex(layoutGrid.color),
          gutterSize: `${layoutGrid.gutterSize}${options.defaultUnit || 'px'}`,
          count: layoutGrid.count,
          offset: `${layoutGrid.offset}${options.defaultUnit || 'px'}`
        }));
      acc[document.name] = { value, description: styles[document.id].description };
      return acc;
    }, {} as Record<string, { value: any; description?: string }>);
  return Object.entries(ret)
    .reduce((acc, [name, { value, description }]) => {
      const splitName = name.split('/');
      let curr = acc;
      splitName.forEach((n) => curr = curr[n] ||= {});
      Object.assign(curr, {
        $type: 'grid',
        $description: description || undefined,
        $value: value
      });
      return acc;
    }, {} as any);
};
