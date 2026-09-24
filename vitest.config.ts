import {
  createRequire,
} from 'node:module';
import {
  fileURLToPath,
} from 'node:url';
import {
  defineConfig,
} from 'vitest/config';

const require = createRequire(import.meta.url);
const packageManagerExecutor = require.resolve('@angular-devkit/schematics/tasks/package-manager/executor');

export default defineConfig({
  resolve: {
    alias: [
      {
        find: packageManagerExecutor,
        replacement: fileURLToPath(new URL('./testing/package-manager-executor-stub.mjs', import.meta.url))
      },
      {
        find: 'ora',
        replacement: fileURLToPath(new URL('./testing/ora-stub.mjs', import.meta.url))
      }
    ],
    tsconfigPaths: true
  },
  test: {
    globals: true,
    passWithNoTests: true,
    testTimeout: 30_000,
    server: {
      deps: {
        inline: [
          '@angular-devkit/schematics',
          'ora'
        ]
      }
    },
    exclude: [
      '**/dist/**',
      '**/*.e2e.spec.ts',
      '**/*.it.spec.ts'
    ],
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
