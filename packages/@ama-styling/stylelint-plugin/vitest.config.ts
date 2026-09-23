import {
  mergeConfig,
} from 'vitest/config';
import baseConfig from '../../../vitest.config';

export default mergeConfig(baseConfig, {
  test: {
    setupFiles: ['./testing/setup-vitest-compat.mjs'],
    passWithNoTests: true,
    exclude: ['**/*.it.spec.ts']
  }
});
