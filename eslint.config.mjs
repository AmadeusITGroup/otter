import { sync } from 'globby';
import { dirname } from 'node:path';
import shared from './eslint.shared.config.mjs';

/** @type (prefix: string, pattern?: string) => string */
const addPrefixPath = (prefix, pattern = '**/*') => pattern.replace(/^(!?)/, `$1${prefix}/`);

/** @type (patterns: string | string[]) => import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray */
const mergeESLintConfig = async (patterns) => {
  const localConfigFiles = sync(patterns);
  /** @type import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray */
  const localConfigs = await localConfigFiles.reduce(async (acc, localConfigFile) => {
    const module = await import(`./${localConfigFile}`);
    const moduleConfig = await (module.default ?? module);
    const configArray = Array.isArray(moduleConfig) ? moduleConfig : [moduleConfig];
    const directory = dirname(localConfigFile);
    return (await acc).concat(
      configArray.map((config) => ({
        ...config,
        ...(config.ignores ? {
          ignores: config.ignores.map((pattern) => addPrefixPath(directory, pattern)),
        } : {}),
        files: (config.files || ['**/*']).flat().map((pattern) => addPrefixPath(directory, pattern))
      }))
    );
  }, Promise.resolve([]));

  return [
    ...shared,
    ...localConfigs
  ]
};

export default mergeESLintConfig('**/eslint.local.config.mjs');
