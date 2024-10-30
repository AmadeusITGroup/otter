import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import o3rPlugin from '@o3r/eslint-plugin';
import yamlParser from 'yaml-eslint-parser';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@o3r/framework/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['tsconfig.eslint.json']
      }
    }
  },
  {
    name: '@o3r/framework/parser/yaml',
    files: ['**/*.y{a,}ml'],
    languageOptions: {
      parser: yamlParser
    }
  },

  {
    name: '@o3r/framework/yarnrc',
    files: ['.yarnrc.yml'],
    plugins: {
      '@o3r': o3rPlugin
    },
    rules: {
      '@o3r/yarnrc-package-extensions-harmonize': ['error']
    }
  },
  {
    name: '@o3r/framework/package-json',
    files: ['package.json'],
    plugins: {
      '@o3r': o3rPlugin
    },
    rules: {
      '@o3r/json-dependency-versions-harmonize': [
        'error',
        {
          ignoredPackages: ['@o3r/build-helpers'],
          ignoredDependencies: ['npm'],
          alignPeerDependencies: false,
          alignEngines: true
        }
      ]
    }
  }
];
