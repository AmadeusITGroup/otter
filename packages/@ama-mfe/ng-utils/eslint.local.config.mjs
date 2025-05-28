import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@ama-mfe/ng-utils/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      }
    }
  },
  {
    name: '@ama-mfe/ng-utils/tests',
    files: ['**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },
  {
    name: '@ama-mfe/ng-utils/messages-definition',
    files: ['**/*.versions.ts', '**/*.consumer.service.ts', '**/routing.service.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: null,
          custom: {
            regex: 'V\\d+(?:_\\d+){0,2}$',
            match: true
          },
          filter: {
            regex: 'Message',
            match: true
          }
        },
        {
          selector: 'property',
          format: null,
          custom: {
            regex: '\\d+(?:\\.\\d+){0,2}$',
            match: true
          },
          filter: {
            regex: '\\.supportedVersions\\.',
            match: true
          }
        }
      ]
    }
  }
];
