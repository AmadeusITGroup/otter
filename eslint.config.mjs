import {
  dirname,
  posix,
  relative,
  sep,
} from 'node:path';
import {
  fileURLToPath,
  pathToFileURL,
} from 'node:url';
import shared from './eslint.shared.config.mjs';
import {
  sync,
} from 'globby';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

/**
 * Add a prefix to a path glob
 * @param {string} prefix
 * @param {string | undefined} pathGlob
 * @returns {string}
 */
const addPrefix = (prefix, pathGlob = '**/*') => pathGlob.replace(/^(!?)(\.?\/)?/, `$1${prefix}/`).replaceAll(sep, posix.sep).replace(/^\//, '');

/**
 * Merge ESLint config
 * @param {string | string[]} globs List of globs to find ESLint config path
 * @returns {Promise<import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray>}
 */
const mergeESLintConfigs = async (globs) => {
  const localConfigFiles = sync(globs, { absolute: true });
  /** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
  let localConfigs = [];
  for (const localConfigFile of localConfigFiles) {
    const module = await import(pathToFileURL(localConfigFile));
    const moduleConfig = await (module.default ?? module);
    /** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
    const configArray = Array.isArray(moduleConfig) ? moduleConfig : [moduleConfig];
    const directory = relative(__dirname, dirname(localConfigFile));
    localConfigs = localConfigs.concat(
      configArray.map((config) => ({
        ...config,
        ...(
          config.ignores
            ? { ignores: config.ignores.map((pathGlob) => addPrefix(directory, pathGlob)) }
            : { files: (config.files || ['**/*']).flat().map((pathGlob) => addPrefix(directory, pathGlob)) }
        )
      }))
    );
  }

  return [
    ...shared,
    ...localConfigs
  ];
};

export default mergeESLintConfigs('**/eslint.local.config.mjs');
