import type {
  promises as fs
} from 'node:fs';
import type {
  Logger
} from '@o3r/core';
import {
  TOKEN_KEY_SEPARATOR
} from '../parsers';
import type {
  DesignTokenVariableSet,
  DesignTokenVariableStructure
} from '../parsers/design-token-parser.interface';
import {
  getCssTokenDefinitionRenderer
} from './css/design-token-definition.renderers';
import {
  getCssStyleContentUpdater
} from './css/design-token-updater.renderers';
import type {
  DesignTokenListTransform,
  DesignTokenRendererOptions
} from './design-token.renderer.interface';

/**
 * Retrieve the path of a target file based on root path if not absolute
 * @param targetFile file to target
 * @param root Root path used to resolve relative targetFile path
 */
const getFilePath = (targetFile: string, root = '.') => {
  const isAbsolutePath = targetFile.startsWith('/') || /^[A-Za-z]:[/\\]/.test(targetFile);
  if (isAbsolutePath) {
    return targetFile;
  } else {
    const joinStr = (root + targetFile);
    const sep = joinStr.includes('/') ? '/' : (joinStr.includes('\\') ? '\\' : '/');
    const stack = [];
    for (const part of `${root.replace(/[/\\]$/, '')}${sep}${targetFile}`.split(sep)) {
      if (part === '..') {
        stack.pop();
      } else if (part !== '.') {
        stack.push(part);
      }
    }
    return stack.join(sep);
  }
};

/**
 * Retrieve the function that determines which file to update for a given token
 * @param root Root path used if no base path
 * @param defaultFile Default file if not requested by the Token
 * @deprecated Use {@link getFileToUpdatePath} instead. Will be removed in v13.
 */
export const computeFileToUpdatePath = (root = '.', defaultFile = 'styles.scss') => (token: DesignTokenVariableStructure) => {
  return token.extensions.o3rTargetFile
    ? getFilePath(token.extensions.o3rTargetFile, token.context?.basePath || root)
    : defaultFile;
};

/**
 * Retrieve the function that determines which file to update for a given token
 * @param root Root path used if no base path
 * @param defaultFile Default file if not requested by the Token
 */
export const getFileToUpdatePath = async (root?: string, defaultFile = 'styles.scss') => {
  try {
    const path = await import('node:path');
    const process = await import('node:process');
    root ||= process.cwd();
    return (token: DesignTokenVariableStructure) => {
      return token.extensions.o3rTargetFile
        ? (path.isAbsolute(token.extensions.o3rTargetFile) ? token.extensions.o3rTargetFile : path.resolve(token.context?.basePath || root!, token.extensions.o3rTargetFile))
        : defaultFile;
    };
  } catch {
    return (token: DesignTokenVariableStructure) => {
      return token.extensions.o3rTargetFile
        ? getFilePath(token.extensions.o3rTargetFile, token.context?.basePath || root)
        : defaultFile;
    };
  }
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
 * Reorganize the Tokens based on an ordered list of regexps.
 * Each regexp is applied only to the last part of the Token name (before key rendering).
 * @param regExps Ordered list of regular expressions defining the order of the Tokens.
 * @param applyRendererName Determine if the regexps are applied to the rendered Token key. If `false`, it will be applied to the Token key's name (last part of the Token name).
 */
export const getTokenSorterFromRegExpList: (regExps: RegExp[], applyRendererName?: boolean) => DesignTokenListTransform = (regExps, applyRendererName = false) => (_variableSet, options) => {
  const applyRegExp = (token: DesignTokenVariableStructure, regExp: RegExp) => (applyRendererName
    ? token.getKey(options?.tokenVariableNameRenderer)
    : token.tokenReferenceName.split(TOKEN_KEY_SEPARATOR).at(-1)!

  ).match(regExp);

  return (tokens) =>
    tokens
      .map((token) => ({ index: regExps.findIndex((regExp) => applyRegExp(token, regExp)), token }))
      .sort((a, b) => {
        if (a.index === -1) {
          if (b.index === -1) {
            return 0;
          }
          return 1;
        } else {
          if (b.index === -1) {
            return -1;
          }
          return b.index - a.index;
        }
      })
      .map(({ token }) => token);
};

/**
 * Retrieve default file writer (based on Node `fs.promise.writeFile` interface)
 * @param existsFile Function determining if the file exists
 * @param logger Custom Logger
 */
export const getDefaultFileWriter = (existsFile: (file: string) => boolean, logger?: Logger): typeof fs.writeFile => {
  return async (file, ...args) => {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- The file path is always proposing the `toString` method
    const fileString = file.toString();
    const { writeFile, mkdir } = await import('node:fs/promises');
    if (!existsFile(fileString)) {
      const path = await import('node:path');
      try {
        await mkdir(path.dirname(fileString), { recursive: true });
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
  const determineFileToUpdate = options?.determineFileToUpdate || await getFileToUpdatePath();
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
      if (!isFileExisting && vars.length === 0) {
        return;
      }
      const newStyleContent = styleContentUpdater(vars, file, styleContent);
      await writeFile(file, newStyleContent);
    })
  );
};
