import o3rPlugin from '@o3r/eslint-plugin';
import {
  defineConfig,
} from 'eslint/config';
import yamlParser from 'yaml-eslint-parser';

export default defineConfig([
  {
    name: '@o3r/framework/projects',
    languageOptions: {
      sourceType: 'module'
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
          ignoredPackages: [
            '@o3r/build-helpers',
            '@o3r/workspace-helpers'
          ],
          ignoredDependencies: ['npm'],
          alignPeerDependencies: false,
          alignEngines: true
        }
      ]
    }
  },
  {
    name: '@o3r/framework/project-json',
    plugins: {
      '@o3r': o3rPlugin
    },
    files: ['**/project.json'],
    rules: {
      '@o3r/project-json-tags': [
        'error',
        {
          allowedTags: ['access:private', 'hook:postinstall']
        }
      ]
    }
  }
]);
