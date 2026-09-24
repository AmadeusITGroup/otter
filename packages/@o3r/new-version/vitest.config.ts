import baseConfig from '../../../vitest.config';

export default {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    setupFiles: ['./testing/setup-vitest.builders.ts', './testing/setup-vitest.ts'],
  }
};
