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
    name: '@ama-terasu/cli/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json',
        ],
      },
    },
  },
  {
    name: '@ama-terasu/cli/package-json',
    files: ['**/package.json'],
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      '@nx/dependency-checks': ['error', {
        buildTargets: ['build', 'build-builders', 'compile', 'test'],
        checkObsoleteDependencies: false,
        checkVersionMismatches: false,
        ignoredDependencies: ['ora', '@o3r/test-helpers', '@o3r/telemetry'],
      }],
    },
  },
];
