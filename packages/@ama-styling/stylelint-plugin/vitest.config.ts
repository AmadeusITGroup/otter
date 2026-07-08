import {
  mergeConfig,
} from 'vitest/config';
import baseConfig from '../../../vitest.config';

export default mergeConfig(baseConfig, {
  test: {
    passWithNoTests: true,
    environment: 'node',
    exclude: ['**/*.it.spec.ts']
  }
});
