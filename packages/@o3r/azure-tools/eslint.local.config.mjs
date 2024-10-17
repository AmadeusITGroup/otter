import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import nxPlugin from '@nx/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@o3r/azure-tools/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.eslint.json',
          'tsconfig.spec.json',
          'tsconfig.build.json',
          'tsconfig.builders.json',
        ],
      },
    },
  },
  {
    name: '@o3r/azure-tools/package-json',
    files: ['**/package.json'],
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      '@nx/dependency-checks': ['error', {
        buildTargets: ['build', 'build-builders', 'compile', 'test'],
        checkObsoleteDependencies: false,
        checkVersionMismatches: false,
        ignoredDependencies: ['@o3r/test-helpers', '@o3r/telemetry'],
      }],
    },
  },
];
