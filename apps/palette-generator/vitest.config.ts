import baseConfig from '../../vitest.config';

export default {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    passWithNoTests: true,
    setupFiles: ['./testing/setup-vitest-compat.mjs', './testing/setup-vitest.ts'],
  }
};
