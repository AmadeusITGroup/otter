const mjsExtRegex = /\.mjs$/i;

/**
 * Jest resolver to replace .mjs imports with .mts for ESM compatibility
 * Copied from https://github.com/kulshekhar/ts-jest/blob/main/e2e/native-esm-ts/mjs-resolver.ts
 * @param path
 * @param options
 */
const mjsResolver = (path, options) => {
  const resolver = options.defaultResolver;
  if (mjsExtRegex.test(path)) {
    try {
      return resolver(path.replace(mjsExtRegex, '.mts'), options);
    } catch {
      // use default resolver
    }
  }
  return resolver(path, options);
};

module.exports = mjsResolver;
