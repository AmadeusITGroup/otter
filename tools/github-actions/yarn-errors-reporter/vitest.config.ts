import baseConfig from '../../../vitest.config';

export default {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    setupFiles: ['./testing/setup-vitest-compat.mjs'],
    passWithNoTests: true,
  }
};
