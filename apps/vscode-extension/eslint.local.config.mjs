import nxPlugin from '@nx/eslint-plugin';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: 'otter-devtools/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ]
      }
    }
  },
  {
    name: 'otter-devtools/package-json-file',
    files: ['**/package.json'],
    plugins: {
      '@nx': nxPlugin
    },
    rules: {
      '@nx/dependency-checks': ['error', {
        'buildTargets': ['build', 'build-builders', 'compile', 'test'],
        'checkObsoleteDependencies': false,
        'checkVersionMismatches': false,
        'ignoredDependencies': ['ora', '@o3r/test-helpers', '@o3r/schematics']
      }]
    }
  }
];
