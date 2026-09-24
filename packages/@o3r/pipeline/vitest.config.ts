import baseConfig from '../../../vitest.config';

export default {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    exclude: [
      ...(baseConfig.test?.exclude ?? []),
      '**/schematics/**/*.spec.ts'
    ],
    setupFiles: ['./testing/setup-vitest.builders.ts'],
  }
};
