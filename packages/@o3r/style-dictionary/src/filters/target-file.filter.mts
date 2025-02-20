import {
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
  defaultTargetFile?: string;
}

/**
 * Legacy configuration to support inputs from @o3r/design templates
 * @deprecated Should prefer simple string to specify the target file, will be removed in v13
 */
interface LegacyFileConfig extends FileRuleNode {
  /** Extensions node in token */
  $extensions: {
    /** Indicate the file where to generate the token */
    o3rTargetFile: string;
  };
}

/** Mapping of the Design Tokens to a given file */
export interface FileRuleNode {
  /** Indicate the file where to generate the token */
  [path: string]: string | FileRuleNode | LegacyFileConfig;
}

const isLegacyConfig = (config: FileRuleNode): config is LegacyFileConfig => typeof (config.$extensions as any)?.o3rTargetFile === 'string';

const getPathMap = (rule: FileRuleNode, path: string[] = [], map: Map<string, string[][]> = new Map()): Map<string, string[][]> => {
  if (isLegacyConfig(rule)) {
    map.set(rule.$extensions.o3rTargetFile, [...(map.get(rule.$extensions.o3rTargetFile) || []), path]);
    return map;
  }
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

  return [
    ...[...fileMap.entries()]
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
    ...(options?.defaultTargetFile
      ? [{ destination: options.rootPath ? resolve(options.rootPath, options.defaultTargetFile) : options.defaultTargetFile, format: options.format }]
      : [])
  ];
};
