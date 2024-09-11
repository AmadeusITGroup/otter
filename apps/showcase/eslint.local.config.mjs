import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
// eslint-disable-next-line no-underscore-dangle
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
