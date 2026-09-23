import angular from '@analogjs/vite-plugin-angular';
import baseConfig from '../../../vitest.config';

export default {
  ...baseConfig,
  plugins: [...(baseConfig.plugins ?? []), angular()],
  test: {
    ...baseConfig.test,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./testing/setup-vitest-compat.mjs', './testing/setup-vitest.builders.ts', './testing/setup-vitest.ts'],
  }
};
