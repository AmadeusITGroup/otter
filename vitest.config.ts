import {
  readFileSync,
} from 'node:fs';
import {
  createRequire,
} from 'node:module';
import {
  resolve,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import ts from 'typescript';
import {
  defineConfig,
} from 'vitest/config';

const require = createRequire(import.meta.url);
const packageManagerExecutor = require.resolve('@angular-devkit/schematics/tasks/package-manager/executor');
const workspaceRoot = fileURLToPath(new URL('.', import.meta.url));
const tsconfigBasePath = resolve(workspaceRoot, 'tsconfig.base.json');
const tsconfigBase = ts.parseConfigFileTextToJson(tsconfigBasePath, readFileSync(tsconfigBasePath, 'utf8')).config as { compilerOptions?: { paths?: Record<string, string[]> } };
const escapeRegExp = (value: string) => value.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&');

/**
 * Aliases of the workspace packages to their sources, applied to every file (as the Jest `moduleNameMapper` did).
 * `resolve.tsconfigPaths` only applies the paths of the tsconfig including the importing file, which does not cover
 * the sources of dependencies without path mapping (e.g. generated SDKs importing `@ama-sdk/core`).
 */
const workspacePathAliases = Object.entries(tsconfigBase.compilerOptions?.paths ?? {})
  .toSorted(([a], [b]) => b.length - a.length)
  .map(([key, [target]]) => ({
    find: new RegExp(`^${escapeRegExp(key).replace('\\*', '(.*)')}$`),
    replacement: resolve(workspaceRoot, target.replace('*', '$1'))
  }));

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
      },
      ...workspacePathAliases
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
