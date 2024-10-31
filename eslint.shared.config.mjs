import o3rTemplate from '@o3r/eslint-config/template';
import nxPlugin from '@nx/eslint-plugin';
import o3rConfig from '@o3r/eslint-config';
import o3rPlugin from '@o3r/eslint-plugin';
import globals from 'globals';
import jsonParser from 'jsonc-eslint-parser';

const nodeFiles = [
  '**/{builders,cli,schematics,scripts,testing}/**/*.{c,m,}{j,t}s',
  '**/tools/{@o3r,github-actions}/*.{c,m,}{j,t}s',
  '**/*.spec.ts',
  '**/jest.config*.js',
  '**/eslint*.config.mjs'
];

export default [
  ...o3rConfig,
  ...o3rTemplate,
  {
    name: '@o3r/framework/ignores',
    ignores: [
      '.cache/**/*',
      '.yarn/**/*',
      '**/dist*/',
      '**/test/',
      '**/tmp/',
      '**/templates/',
      '**/.attachments/',
      '**/generated-doc/',
      '**/packaged-action/',
      '.pnp.js',
      '.vscode',
      '**/src/**/package.json'
    ]
  },
  {
    name: '@o3r/framework/report-unused-disable-directives',
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  {
    name: '@o3r/framework/settings',
    settings: {
      'import/resolver': 'node'
    },
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 12
    }
  },
  {
    name: '@o3r/framework/commonjs',
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.commonjs
      }
    }
  },
  {
    name: '@o3r/framework/node',
    files: nodeFiles,
    languageOptions: {
      globals: {
        ...globals.node,
        NodeJS: true,
        globalThis: true
      }
    }
  },
  {
    name: '@o3r/framework/browser',
    files: [
      '**/*.{c,m,}{j,t}s'
    ],
    ignores: nodeFiles,
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },
  {
    name: '@o3r/framework/parser/json',
    files: ['**/*.json'],
    languageOptions: {
      parser: jsonParser
    }
  },
  {
    name: '@o3r/framework/jasmine',
    files: ['**/*{.,-}jasmine.ts'],
    rules: {
      'jest/no-jasmine-globals': 'off'
    },
    languageOptions: {
      globals: {
        ...globals.jasmine
      }
    }
  },
  {
    name: '@o3r/framework/spec',
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off', // required by Jest to mock the imports
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'error'
    }
  },
  {
    name: '@o3r/framework/setup-jest',
    files: ['**/setup-jest.ts'],
    rules: {
      'unicorn/no-empty-file': 'off',
    }
  },
  {
    name: '@o3r/framework/package-json',
    files: ['package.json'],
    plugins: {
      '@nx': nxPlugin,
      '@o3r': o3rPlugin
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          buildTargets: ['build', 'build-builders', 'compile', 'test'],
          checkObsoleteDependencies: false,
          checkVersionMismatches: false,
          ignoredDependencies: ['ora', '@o3r/test-helpers'],
          ignoredFiles: ['**/*.spec.ts']
        }
      ],
      '@o3r/json-dependency-versions-harmonize': [
        'error',
        {
          ignoredPackages: ['@o3r/build-helpers'],
          alignPeerDependencies: false,
          alignEngines: true
        }
      ]
    }
  },
  {
    name: '@o3r/framework/no-underscore-dangle',
    rules: {
      'no-underscore-dangle': [
        'error',
        {
          allowAfterThis: true,
          allow: [
            '_OTTER_DEVTOOLS_',
            '__OTTER_STORYBOOK_STYLE_METADATA__',
            '__OTTER_STORYBOOK_LOCALIZATION_METADATA__',
            '__OTTER_STORYBOOK_CONFIGURATION_METADATA__'
          ]
        }
      ]
    }
  },
  {
    name: '@o3r/framework/mjs-files',
    files: ['**/*.mjs'],
    rules: {
      'no-underscore-dangle': [
        'error',
        {
          allowAfterThis: true,
          allow: ['__filename', '__dirname']
        }
      ]
    }
  },
  {
    name: '@o3r/framework/disabled-for-discussion',
    files: ['**/*.{c,m,}{t,j}s'],
    rules: {
      '@stylistic/comma-dangle': 'off',
      '@stylistic/quote-props': 'off',
      'jsdoc/require-param-description': 'off',
      'unicorn/no-await-expression-member': 'off'
    }
  },
  {
    name: '@o3r/framework/warn-until-migration-completed',
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn'
    }
  },
  {
    name: '@o3r/framework/it-tests',
    files: ['**/*.it.spec.ts'],
    rules: {
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['jest-environment', 'jest-environment-o3r-app-folder', 'jest-environment-o3r-type']
        }
      ],
      'import/first': 'off' // We have the jest environment setup first
    }
  }
];
