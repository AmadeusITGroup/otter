import angular from '@analogjs/vite-plugin-angular';
import baseConfig from '../../../vitest.config';

export default {
  ...baseConfig,
  plugins: [...(baseConfig.plugins ?? []), angular()],
  test: {
    ...baseConfig.test,
    exclude: [
      ...(baseConfig.test?.exclude ?? []),
      // Schematic specs are a retained Jest boundary (see
      // docs/testing/TEST_RUNNER_POLICY.md): they drive the Angular DevKit
      // `SchematicTestRunner` through CommonJS, which Vitest's ESM loader cannot
      // resolve. They run on the retained Jest harness
      // (testing/jest.config.schematics.js).
      '**/schematics/**/*.spec.ts'
    ],
    environment: 'jsdom',
    // Align the jsdom base URL with the value the Jest environment used
    // (`http://localhost`, no port); some specs assert on
    // `window.location.origin`. Vitest's jsdom otherwise defaults to
    // `http://localhost:3000`.
    environmentOptions: {
      ...baseConfig.test?.environmentOptions,
      jsdom: {
        ...baseConfig.test?.environmentOptions?.jsdom,
        url: 'http://localhost'
      }
    },
    setupFiles: ['./testing/setup-vitest.builders.ts', './testing/setup-vitest.ts'],
  }
};
