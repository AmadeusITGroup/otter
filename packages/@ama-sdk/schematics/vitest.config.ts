import baseConfig from '../../../vitest.config';

export default {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    exclude: [
      ...(baseConfig.test?.exclude ?? []),
      // Schematic specs are a retained Jest boundary (see
      // docs/testing/TEST_RUNNER_POLICY.md): they drive the Angular DevKit
      // `SchematicTestRunner` / virtual file system through CommonJS, which
      // Vitest's ESM loader cannot resolve. They run on the retained Jest
      // harness (testing/jest.config.schematics.js).
      '**/schematics/**/*.spec.ts'
    ],
    setupFiles: ['./testing/setup-vitest.ts'],
  }
};
