import type { DesignTokenVariableSet, DesignTokenVariableStructure } from '../parsers/design-token-parser.interface';
import { getCssTokenDefinitionRenderer } from './css/design-token-definition.renderers';
import { getCssStyleContentUpdater } from './css/design-token-updater.renderers';
import { existsSync, promises as fs } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import type { DesignTokenRendererOptions, TokenListTransform } from './design-token.renderer.interface';

/**
 * Retrieve the function that determines which file to update for a given token
 * @param root Root path used if no base path
 * @param defaultFile Default file if not requested by the Token
 */
export const computeFileToUpdatePath = (root = process.cwd(), defaultFile = 'styles.scss') => (token: DesignTokenVariableStructure) => {
  if (token.extensions.o3rTargetFile) {
    return isAbsolute(token.extensions.o3rTargetFile) ? token.extensions.o3rTargetFile : resolve(token.context?.basePath || root, token.extensions.o3rTargetFile);
  }

  return defaultFile;
};

/**
 * Compare Token variable by name
 * @param a first token variable
 * @param b second token variable
 * @deprecated use {@link getTokenSorterByName} instead. Will be removed in v13.
 */
export const compareVariableByName = (a: DesignTokenVariableStructure, b: DesignTokenVariableStructure): number => a.getKey().localeCompare(b.getKey());

/**
 * Sort Token variable by name using the local alphabetical order
 * @param _variableSet Complete set of the parsed Design Token
 */
export const getTokenSorterByName: TokenListTransform = (_variableSet) => (tokens) => tokens.sort((a, b) => a.getKey().localeCompare(b.getKey()));


/**
 * Reorganize the Tokens to ensure that all the Tokens with references have they references definition before in the order
 * @param variableSet Complete set of the parsed Design Token
 */
export const getTokenSorterByRef: TokenListTransform = (variableSet) => {
  /**
   * Get the maximum number of reference levels for a Design Token, following its references
   * @param token Design Token
   * @param level Value of the current level
   * @param mem Memory of the visited node
   */
  const getReferenceLevel = (token: DesignTokenVariableStructure, level = 0, mem: DesignTokenVariableStructure[] = []): number => {
    const children = token.getReferencesNode(variableSet);
    if (children.length === 0 || mem.includes(token)) {
      return level;
    } else {
      level++;
      mem = [...mem, token];
      return Math.max(...children.map((child) => getReferenceLevel(child, level, mem)));
    }
  };

  return (tokens) => {
    const limit = Math.max(...tokens.map((t) => getReferenceLevel(t)));
    let sortToken = [...tokens];
    for (let i = 0; i < limit + 1; i++) {
      let hasChanged = false;
      const tmpSortToken: DesignTokenVariableStructure[] = [];
      for (const token of sortToken) {
        const firstRef = tmpSortToken.findIndex((t) => t.getReferences(variableSet).includes(token.tokenReferenceName));
        if (firstRef > -1) {
          tmpSortToken.splice(firstRef, 0, token);
          hasChanged = true;
        } else {
          tmpSortToken.push(token);
        }
      }
      sortToken = tmpSortToken;
      if (!hasChanged) {
        break;
      }
    }

    return sortToken;
  };
};

/**
 * Process the parsed Design Token variables and render them according to the given options and renderers
 * @param variableSet Complete list of the parsed Design Token
 * @param options Parameters of the Design Token renderer
 * @example Basic renderer usage
 * ```typescript
 * import { parseDesignTokenFile, renderDesignTokens } from '@o3r/design';
 *
 * // List of parsed Design Token items
 * const parsedTokenDesign = await parseDesignTokenFile('./path/to/spec.json');
 *
 * // Render the CSS variables
 * await renderDesignTokens(parsedTokenDesign, { logger: console });
 * ```
 */
export const renderDesignTokens = async (variableSet: DesignTokenVariableSet, options?: DesignTokenRendererOptions) => {
  const readFile = options?.readFile || ((filePath: string) => fs.readFile(filePath, {encoding: 'utf8'}));
  const writeFile = options?.writeFile || fs.writeFile;
  const existsFile = options?.existsFile || existsSync;
  const determineFileToUpdate = options?.determineFileToUpdate || computeFileToUpdatePath();
  const tokenDefinitionRenderer = options?.tokenDefinitionRenderer || getCssTokenDefinitionRenderer();
  const styleContentUpdater = options?.styleContentUpdater || getCssStyleContentUpdater();
  const tokenPerFile = Array.from(variableSet.values())
    .reduce((acc, designToken) => {
      const filePath = determineFileToUpdate(designToken);
      acc[filePath] ||= [];
      acc[filePath].push(designToken);
      return acc;
    }, {} as Record<string, DesignTokenVariableStructure[]>);

  const updates = Object.fromEntries(
    Object.entries(tokenPerFile)
      .map(([file, designTokens]) => {
        designTokens = options?.variableSortComparator ? designTokens.sort(options.variableSortComparator) : designTokens;
        designTokens = (options?.tokenListTransforms?.map((transform) => transform(variableSet)) || [getTokenSorterByName(variableSet)])
          .reduce((acc, transform) => transform(acc), designTokens);
        return [
          file,
          designTokens
            .map((designToken) => tokenDefinitionRenderer(designToken, variableSet))
            .filter((variable): variable is string => !!variable)
        ];
      })
  );

  await Promise.all(
    Object.entries(updates).map(async ([file, vars]) => {
      const isFileExisting = existsFile(file);
      const styleContent = isFileExisting ? await readFile(file) : '';
      if (!isFileExisting && !vars.length) {
        return;
      }
      const newStyleContent = styleContentUpdater(vars, file, styleContent);
      await writeFile(file, newStyleContent);
    })
  );
};
