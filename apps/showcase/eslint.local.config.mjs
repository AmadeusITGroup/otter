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
    name: '@o3r/showcase/ignores',
    ignores: [
      'dev-resources/**/*',
      'playwright-reports/**/*',
      'test-results/**/*',
      '*.metadata.json',
      'src/assets/trainings/sdk/**/*',
      'src/coi-serviceworker.js',
      'training-assets/**/*'
    ]
  },
  {
    name: '@o3r/showcase/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      }
    }
  },
  {
    name: '@o3r/showcase/playwright',
    files: ['**/e2e-playwright/**'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    name: '@o3r/showcase/scripts-mjs',
    files: ['scripts/**/*.mjs'],
    rules: {
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            '^@o3r/style-dictionary' // for mjs resolving when not built
          ]
        }
      ]
    }
  },
  {
    name: '@o3r/showcase/typescript-files',
    files: ['**/*.ts'],
    rules: {
      '@o3r/o3r-widget-tags': [
        'error',
        {
          widgets: {
            DESTINATION_ARRAY: {
              minItems: {
                type: 'number'
              },
              allDestinationsDifferent: {
                type: 'boolean'
              },
              atLeastOneDestinationAvailable: {
                type: 'boolean'
              },
              destinationPattern: {
                type: 'string'
              }
            }
          }
        }
      ],
      '@o3r/o3r-restriction-key-tags': [
        'error',
        {
          supportedKeys: ['api owners']
        }
      ]
    }
  }
];
