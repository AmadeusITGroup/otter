'use strict';
const { dirname, posix, relative, sep } = require('node:path');
const { pathToFileURL } = require('node:url');
const { defineConfig } = require('eslint/config');
const { sync } = require('globby');

/**
 * Add a prefix to a path glob
 * @param {string} prefix
 * @param {string | undefined} pathGlob
 * @returns {string}
 */
const addPrefix = (prefix, pathGlob = '**/*') => pathGlob.replace(/^(!?)(\.?\/)?/, `$1${prefix}/`).replaceAll(sep, posix.sep).replace(/^\//, '');

/**
 * Merge ESLint flat config
 * @param {string} localDirname The directory name of the current module
 * @param {string | string[]} globs List of globs to find ESLint config path
 * @param {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray[]} additionalConfigs List of additional config to apply first
 * @returns {Promise<import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray>}
 */
const mergeESLintFlatConfigs = async (localDirname, globs, ...additionalConfigs) => {
  const localConfigFiles = sync(globs, { absolute: true });
  /** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
  let configs = [];
  for (const localConfigFile of localConfigFiles) {
    const module = await import(pathToFileURL(localConfigFile));
    const moduleConfig = await (module.default ?? module);
    /** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
    const configArray = Array.isArray(moduleConfig) ? moduleConfig : [moduleConfig];
    const directory = relative(localDirname, dirname(localConfigFile));
    configs = configs.concat(
      configArray.map((config) => ({
        ...config,
        ...(
          config.ignores
            ? {
              ignores: config.ignores.map((pathGlob) => addPrefix(directory, pathGlob)),
              ...config.files && config.files.flat().map((pathGlob) => addPrefix(directory, pathGlob))
            }
            : { files: (config.files || ['**/*']).flat().map((pathGlob) => addPrefix(directory, pathGlob)) }
        )
      }))
    );
  }

  return defineConfig([
    ...additionalConfigs,
    ...configs
  ]);
};

module.exports = {
  mergeESLintFlatConfigs
};
