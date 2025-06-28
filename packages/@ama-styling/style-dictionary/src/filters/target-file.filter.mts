import {
  normalize,
  resolve,
} from 'node:path';
import type {
  File,
  FormatFn,
} from 'style-dictionary/types';
import {
  deflatten,
} from '../helpers/config-deflatten.helpers.mjs';

/** Options to get file filters */
interface TargetFileOptions {
  /** format to apply to the files */
  format?: string | FormatFn;
  /** Root path to calculate the target file */
  rootPath?: string;
  /** Default file if not matching any rule */
  defaultFile?: string;
}

/** Mapping of the Design Tokens to a given file */
export interface FileRuleNode {
  /** Indicate the file where to generate the token */
  [path: string]: string | FileRuleNode;
}

const getPathMap = (rule: FileRuleNode, path: string[] = [], map: Map<string, string[][]> = new Map()): Map<string, string[][]> => {
  return Object.entries(rule)
    .filter(([name]) => name !== '$extensions')
    .reduce((acc, [name, value]) => {
      const currentPath = [...path, name];
      if (typeof value === 'string') {
        acc.set(value, [...(acc.get(value) || []), currentPath]);
        return acc;
      }

      return getPathMap(value, currentPath, acc);
    }, map);
};

/**
 * Get the list of the target files based of given rule
 * @param fileRules List of file targets based on token rule
 * @param options
 */
export const getTargetFiles = (fileRules: FileRuleNode, options?: TargetFileOptions): File[] => {
  const flatterRules = deflatten(fileRules);
  const fileMap = getPathMap(flatterRules);
  const fileMapEntries = [...fileMap.entries()];

  return [
    ...fileMapEntries
      .map(([filePath, nodes]): File => {
        return {
          destination: options?.rootPath ? resolve(options.rootPath, filePath) : filePath,
          format: options?.format,
          filter: (token) =>
            nodes.some((path) =>
              path.every((item, idx) => token.path[idx] === item)
            )
        };
      }),
    ...(options?.defaultFile
      ? [{
        destination: options.rootPath ? resolve(options.rootPath, options.defaultFile) : options.defaultFile,
        format: options?.format,
        filter: (token) =>
          !fileMapEntries
            .filter(([filePath]) => normalize(filePath) !== normalize(options.defaultFile!))
            .some(([, nodes]) =>
              nodes.some((path) =>
                path.every((item, idx) => token.path[idx] === item)
              )
            )
      } satisfies File]
      : [])
  ];
};
