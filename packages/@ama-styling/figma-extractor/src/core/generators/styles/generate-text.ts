import type {
  ApiClient,
} from '@ama-sdk/core';
import {
  FilesApi,
  type GetFile200Response,
  type GetLocalVariables200ResponseMeta,
} from '@ama-styling/figma-sdk';
import {
  getVariablesFormatter,
} from '../../helpers/variable-formatter';
import type {
  FigmaFileContext,
} from '../../interfaces';

interface Font {
  fontFamily: string;
  fontSize: string;
  fontWeight: number | string;
  letterSpacing: string;
  lineHeight: string;
  textTransform: string;
  textDecoration: string;
}

/** Options to {@link generateTextStyles} */
export interface TextStylesOptions extends FigmaFileContext {
}

/**
 * Generate text style tokens
 * @param apiClient Api Client
 * @param figmaFile Figma File information
 * @param localVariablesResponse list of file variables
 * @param options Options
 */
export const generateTextStyles = async (
  apiClient: ApiClient,
  figmaFile: Promise<GetFile200Response>,
  localVariablesResponse: GetLocalVariables200ResponseMeta,
  options: TextStylesOptions
) => {
  const formatVariables = getVariablesFormatter(localVariablesResponse);
  const filesApi = new FilesApi(apiClient);
  const styles = (await figmaFile).styles;
  const ids = Object.entries(styles)
    .filter(([, { styleType, remote }]) => styleType === 'TEXT' && !remote)
    .map(([id]) => id)
    .join(',');
  const nodes = (await filesApi.getFileNodes({ file_key: options.fileKey, ids })).nodes;
  const ret = Object.values(nodes)
    .reduce((acc, { document }) => {
      const style = (document as any).style as Font | undefined;
      const fontFamily = formatVariables(document.boundVariables?.fontFamily)
        ?? style?.fontFamily ?? 'none';
      const fontSize = formatVariables(document.boundVariables?.fontSize)
        ?? style?.fontSize ?? 'none';
      const fontWeight = formatVariables(document.boundVariables?.fontWeight)
        ?? style?.fontWeight ?? 'none';
      const letterSpacing = formatVariables(document.boundVariables?.letterSpacing)
        ?? style?.letterSpacing ?? 'none';
      const lineHeight = formatVariables(document.boundVariables?.lineHeight)
        ?? style?.lineHeight ?? 'none';
      const textDecoration = 'none';
      const textTransform = 'none';

      const value = {
        fontFamily,
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight,
        textDecoration,
        textTransform
      } satisfies Font;
      acc[document.name] = { value, description: styles[document.id].description };
      return acc;
    }, {} as Record<string, { description?: string; value: Font }>);
  return Object.entries(ret)
    .reduce((acc, [name, { value, description }]) => {
      const splitName = name.split('/');
      let curr = acc;
      splitName.forEach((n) => curr = curr[n] ||= {});
      Object.assign(curr, {
        $type: 'typography',
        $description: description || undefined,
        $value: value
      });
      return acc;
    }, {} as any);
};
