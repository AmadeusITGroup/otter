import {
  dirname
} from 'node:path';
import {
  fileURLToPath
} from 'node:url';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@o3r/showcase/ignores',
    ignores: [
      'dev-resources/**/*',
      'playwright-reports/**/*',
      'test-results/**/*',
      '*.metadata.json'
    ]
  },
  {
    name: '@o3r/showcase/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.app.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ]
      }
    },
  },
  {
    name: '@o3r/showcase/globals',
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },
  {
    name: '@o3r/showcase/typescript-files',
    files: ['**/*.ts'],
    rules: {
      '@o3r/o3r-widget-tags': [
        'error',
        {
          'widgets': {
            'DESTINATION_ARRAY': {
              'minItems': {
                'type': 'number'
              },
              'allDestinationsDifferent': {
                'type': 'boolean'
              },
              'atLeastOneDestinationAvailable': {
                'type': 'boolean'
              },
              'destinationPattern': {
                'type': 'string'
              }
            }
          }
        }
      ]
    }
  }
];
