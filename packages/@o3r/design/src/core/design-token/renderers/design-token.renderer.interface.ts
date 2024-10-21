import type { DesignTokenVariableSet, DesignTokenVariableStructure, TokenKeyRenderer } from '../parsers';
import type { Logger } from '@o3r/core';

/**
 * Updater function to append the rendered variable into a file content
 * @param variables List of rendered variables to append
 * @param file Path to the file to edit
 * @param styleContent current content where to append the variables
 * @returns new content
 */
export type DesignContentFileUpdater = (variables: string[], file: string, styleContent?: string) => string;

/**
 * Render the Design Token variable
 * @param tokenStructure Parsed Design Token
 * @param variableSet Complete list of the parsed Design Token
 */
export type TokenDefinitionRenderer = (tokenStructure: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => string | undefined;

/**
 * Options of the Design Token list transform function
 */
export interface DesignTTokenListTransformOptions {
  /**
   * Renderer the name of generated variable (without the prefix required by the target language)
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;
}

/**
 * Function defining the way the variable should be sorted before being generated
 */
export type DesignTokenListTransform = (variableSet: DesignTokenVariableSet, options?: DesignTTokenListTransformOptions) => (tokens: DesignTokenVariableStructure[]) => DesignTokenVariableStructure[];

/**
 * Options of the Design Token Renderer value
 */
export interface DesignTokenRendererOptions {
  /**
   * Comparator to sort variable before rendering
   * @param a first Design Token
   * @param b second Design Token
   * @deprecated Use {@link tokenListTransform} instead. Will be removed in v13
   */
  variableSortComparator?: (a: DesignTokenVariableStructure, b: DesignTokenVariableStructure) => number;

  /**
   * List of tokens transform functions. The transformation will be applied per file.
   * Note: the order of the output array will be kept when generating the code
   */
  tokenListTransforms?: DesignTokenListTransform[];

  /** Custom Style Content updated function */
  styleContentUpdater?: DesignContentFileUpdater;

  /**
   * Renderer the name of generated variable (without the prefix required by the target language)
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;

  /**
   * Custom function to determine the file to update for a given Design Token
   * @param token Design Token Variable
   */
  determineFileToUpdate?: (token: DesignTokenVariableStructure) => string;

  /** Custom function to render the Design Token variable */
  tokenDefinitionRenderer?: TokenDefinitionRenderer;

  /**
   * Custom function to read a file required by the token renderer
   * @default {@see fs.promises.readFile}
   * @param filePath Path to the file to read
   */
  readFile?: (filePath: string) => string | Promise<string>;

  /**
   * Custom function to determine if file required by the token renderer exists
   * @default {@see fs.existsSync}
   * @param filePath Path to the file to check
   * @returns
   */
  existsFile?: (filePath: string) => boolean;

  /**
   * Custom function to write a file required by the token renderer
   * @default {@see fs.promise.writeFile}
   * @param filePath Path to the file to write
   * @param content Content to write
   */
  writeFile?: (filePath: string, content: string) => void | Promise<void>;
  /**
   * Custom logger
   * Nothing will be logged if not provided
   */
  logger?: Logger;
}
