import angular from '@analogjs/vite-plugin-angular';
import baseConfig from '../../../vitest.config';

export default {
  ...baseConfig,
  plugins: [...(baseConfig.plugins ?? []), angular()],
  test: {
    ...baseConfig.test,
    exclude: [
      ...(baseConfig.test?.exclude ?? []),
      '**/schematics/**/*.spec.ts'
    ],
    environment: 'jsdom',
    setupFiles: ['./testing/setup-vitest.builders.ts', './testing/setup-vitest.ts'],
  }
};
