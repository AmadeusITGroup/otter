import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import o3rPlugin from '@o3r/eslint-plugin';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@o3r/testing/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        NodeJS: true
      }
    }
  }, {
    name: '@o3r/framework/package-json',
    files: ['package.json'],
    // TODO remove once angular-devkit's peer dependency for jest is updated to 30
    plugins: {
      '@o3r': o3rPlugin
    },
    rules: {
      '@o3r/json-dependency-versions-harmonize': [
        'error',
        {
          dependencyTypes: ['optionalDependencies', 'dependencies', 'devDependencies', 'peerDependencies'],
          alignEngines: true
        }
      ]
    }
  }
];
