import type {
  GetLocalVariables200ResponseMeta,
  Style,
} from '@ama-styling/figma-sdk';
import {
  getCollectionFileName,
  getStyleFileName,
} from '../helpers/file-names';
import type {
  FigmaFileContext,
} from '../interfaces';
import {
  type ManifestStyle,
  styleTypeMapping,
} from './styles/interfaces';

export interface Collection {
  modes: Record<string, string[]>;
}

export interface Manifest {
  name: string;
  collections: Record<string, Collection>;
  styles: ManifestStyle;
}

export interface GenerateManifestOptions extends FigmaFileContext {
  name?: string;
}

export const generateManifest = async (
  localVariablesResponse: GetLocalVariables200ResponseMeta,
  stylesFromFile: Promise<{ styles: Record<string, Style> }>,
  options?: GenerateManifestOptions
) => {
  const styleTypes = [...new Set(
    Object.values((await stylesFromFile).styles)
      .map(({ styleType }) => styleType)
  )];

  const styles = styleTypes.reduce((acc, styleType) => {
    const styleLabel = styleTypeMapping[styleType];
    acc[styleLabel] = [getStyleFileName(styleType)];
    return acc;
  }, {} as ManifestStyle);

  const collections = Object.fromEntries(
    Object.values(localVariablesResponse.variableCollections)
      .filter(({ remote }) => !remote)
      .map(({ modes, name }): [string, Collection] => ([
        name,
        {
          modes: Object.fromEntries(modes.map((mode) => ([mode.name, [getCollectionFileName(name, mode)]])))
        }
      ]))
  );

  return {
    name: options?.name || 'Design Tokens',
    collections,
    styles
  } satisfies Manifest;
};
