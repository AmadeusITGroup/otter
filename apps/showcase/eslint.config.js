const {globalSharedConfig} = require('../../eslint.config.js');
const {default: o3rTemplate} = require('@o3r/eslint-config/template');

module.exports = [
  ...globalSharedConfig,
  ...o3rTemplate,
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
