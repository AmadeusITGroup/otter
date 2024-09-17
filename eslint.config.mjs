import { sync } from 'globby';
import { dirname } from 'node:path';
import shared from './eslint.shared.config.mjs';

/** @type (prefix: string, pattern?: string) => string */
const addPrefixPath = (prefix, pattern = '**/*') => pattern.replace(/^(!?)(\.?\/)?/, `$1${prefix}/`);

/** @type (patterns: string | string[]) => import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray */
const mergeESLintConfig = async (patterns) => {
  const localConfigFiles = sync(patterns, { absolute: true });
  /** @type import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray */
  let localConfigs = [];
  for (const localConfigFile of localConfigFiles) {
    const module = await import(localConfigFile);
    const moduleConfig = await (module.default ?? module);
    const configArray = Array.isArray(moduleConfig) ? moduleConfig : [moduleConfig];
    const directory = dirname(localConfigFile);
    const addDirectoryFn = (pattern) => addPrefixPath(directory, pattern);
    localConfigs = localConfigs.concat(
      configArray.map((config) => ({
        ...config,
        files: (config.files || ['**/*']).flat().map(addDirectoryFn),
        ...(
          config.ignores
          ? { ignores: config.ignores.map(addDirectoryFn) }
          : {}
        )
      }))
    );
  }

  return [
    ...shared,
    ...localConfigs
  ];
};

export default mergeESLintConfig('**/eslint.local.config.mjs');
