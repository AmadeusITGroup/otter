import {
  defineConfig,
} from 'vitest/config';

export default defineConfig({
  test: {
    reporters: [
      'default',
      'github-actions',
      'junit'
    ],
    outputFile: {
      junit: './dist-test/junit.xml'
    },
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reporter: ['cobertura']
    }
  }
});
