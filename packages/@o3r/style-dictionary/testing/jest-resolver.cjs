/**
 * Custom Jest resolver to map .mjs imports to .mts source files
 * Required for ESM support with .mts files
 * @see https://kulshekhar.github.io/ts-jest/docs/guides/esm-support#resolve-mjsmts-extensions
 */
module.exports = (path, options) => {
  const mjsExtRegex = /\.mjs$/i;
  const resolver = options.defaultResolver;

  if (mjsExtRegex.test(path)) {
    try {
      return resolver(path.replace(mjsExtRegex, '.mts'), options);
    } catch {
      // Fall back to default resolver if .mts file doesn't exist
    }
  }

  return resolver(path, options);
};
