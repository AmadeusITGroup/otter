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

/** Collection as described in Figma variables */
export interface Collection {
  /** List of variables modes */
  modes: Record<string, string[]>;
}

/** Manifest describing the Design Token files associated */
export interface Manifest {
  /** Name of the Design Token set */
  name: string;
  /** List of the variable collections */
  collections: Record<string, Collection>;
  /** List of Figma defined styles */
  styles: ManifestStyle;
}

/** Options for the Manifest generating function */
export interface GenerateManifestOptions extends FigmaFileContext {
  /** Name of the Design Token Manifest */
  name?: string;
}

/**
 * Generate the Design Token Manifest
 * @param localVariablesResponse Information relative to the Figma File local variables
 * @param stylesFromFile List of Styles from the Figma File information
 * @param options
 */
export const generateManifest = async (
  localVariablesResponse: Promise<GetLocalVariables200ResponseMeta>,
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
    Object.values((await localVariablesResponse).variableCollections)
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
