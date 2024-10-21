import type { DesignTokenVariableSet, DesignTokenVariableStructure } from '../parsers/design-token-parser.interface';
import { getCssTokenDefinitionRenderer } from './css/design-token-definition.renderers';
import { getCssStyleContentUpdater } from './css/design-token-updater.renderers';
import type { Logger } from '@o3r/core';
import type { promises as fs } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import type { DesignTokenListTransform, DesignTokenRendererOptions } from './design-token.renderer.interface';

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
 * @param _variables Complete set of the parsed Design Token
 * @param options Parameters of the Design Token list transform function
 */
export const getTokenSorterByName: DesignTokenListTransform = (_variables, options) => {
  const splitNameRegExp = /^(.*?)(\d+)$/;
  return (tokens) => tokens.sort((a, b) => {
    const keyA = a.getKey(options?.tokenVariableNameRenderer);
    const keyB = b.getKey(options?.tokenVariableNameRenderer);
    const splitA = splitNameRegExp.exec(keyA);
    const splitB = splitNameRegExp.exec(keyB);
    if (splitA && splitB) {
      const [, nameA, gradeA] = splitA;
      const [, nameB, gradeB] = splitB;
      if (nameA === nameB) {
        return +gradeA - +gradeB;
      }
    }
    return keyA.localeCompare(keyB);
  });
};


/**
 * Reorganize the Tokens to ensure that all the Tokens with references have they references definition before in the order
 * @param variableSet Complete set of the parsed Design Token
 */
export const getTokenSorterByRef: DesignTokenListTransform = (variableSet) => {
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
 * Retrieve default file writer (based on Node `fs.promise.writeFile` interface)
 * @param existsFile Function determining if the file exists
 * @param logger Custom Logger
 * @returns
 */
export const getDefaultFileWriter = (existsFile: (file: string) => boolean, logger?: Logger): typeof fs.writeFile => {
  return async (file, ...args) => {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- The file path is always proposing the `toString` method
    const fileString = file.toString();
    const { writeFile, mkdir } = await import('node:fs/promises');
    if (!existsFile(fileString)) {
      const { dirname } = await import('node:path');
      try {
        await mkdir(dirname(fileString), { recursive: true });
      } catch {
        // ignore folder creation failure
      }
    }
    const res = await writeFile(file, ...args);
    logger?.info?.(`Updated ${fileString} with Design Token content.`);
    return res;
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
  const readFile = options?.readFile || (async (filePath: string) => (await import('node:fs/promises')).readFile(filePath, { encoding: 'utf8' }));
  const existsFile = options?.existsFile || (await import('node:fs')).existsSync;
  const writeFile = options?.writeFile || getDefaultFileWriter(existsFile, options?.logger);
  const determineFileToUpdate = options?.determineFileToUpdate || computeFileToUpdatePath();
  const tokenDefinitionRenderer = options?.tokenDefinitionRenderer || getCssTokenDefinitionRenderer(options);
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
        designTokens = (options?.tokenListTransforms?.map((transform) => transform(variableSet, options)) || [getTokenSorterByName(variableSet, options)])
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
