'use strict';
const { readFileSync } = require('node:fs');
const { dirname, posix, relative, sep, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');
const { convertIgnorePatternToMinimatch } = require('@eslint/compat');
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

/**
 * Checks if a gitattributes attribute entry matches the requested attribute.
 * @param {string} entry The attribute entry from the line (e.g., "attr", "-attr", "attr=value").
 * @param {string} attrName The attribute name to match.
 * @param {string|undefined} attrValue The expected value, or undefined for bare name matching.
 * @returns {boolean} Whether the entry matches.
 */
function matchesAttribute(entry, attrName, attrValue) {
  // Unset: -attr
  if (entry.startsWith('-')) {
    return false;
  }

  const [entryName, entryValue] = entry.split('=');

  if (entryValue === undefined) {
    // Bare entry: "attr" — matches bare name queries only
    return attrValue === undefined && entryName === attrName;
  }

  if (entryName !== attrName) {
    return false;
  }

  if (attrValue !== undefined) {
    // name=value query: exact match
    return entryValue === attrValue;
  }

  // Bare name query with value entry: only "true" is truthy
  return entryValue === 'true';
}

/**
 * Reads a .gitattributes file and returns an object with ignore patterns
 * for files matching the specified attribute.
 * @param {string} gitattributesPath The absolute path to the .gitattributes file.
 * @param {string} attribute The attribute to match. Either a bare name or "name=value".
 * @param {string} name The name of the config.
 * @returns {import('@typescript-eslint/utils').TSESLint.FlatConfig} An object with `name` and `ignores` properties.
 * @throws {Error} If the path is not an absolute path.
 */
function ignoreFilesWithGitAttribute(gitattributesPath, attribute, name) {
  if (!isAbsolute(gitattributesPath)) {
    throw new Error('The ignore file location must be an absolute path.');
  }

  const [attrName, attrValue] = attribute.split('=');

  const file = readFileSync(gitattributesPath, 'utf8');
  const lines = file
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  return {
    name: name || `Ignore files based on .gitattributes patterns for ${attribute}`,
    ignores: lines
      .map((line) => line.split(/\s+/u))
      .filter((parts) =>
        parts
          .slice(1)
          .some((entry) =>
            matchesAttribute(entry, attrName, attrValue)
          )
      )
      .map((parts) => convertIgnorePatternToMinimatch(parts[0]))
  };
}

module.exports = {
  mergeESLintFlatConfigs,
  ignoreFilesWithGitAttribute
};
