/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.eslint.json'
    ],
    'ecmaVersion': 12
  },
  'overrides': [
    {
      'files': [
        '*.{c,m,}{t,j}s'
      ],
      'parser': require.resolve('@typescript-eslint/parser'),
      'extends': ['@o3r/eslint-config-otter'].map(require.resolve)
    },
    {
      'files': [
        '*{.,-}jasmine.ts'
      ],
      'rules': {
        'jest/no-jasmine-globals': 'off'
      }
    },

    {
      'parser': require.resolve('jsonc-eslint-parser'),
      'files': [
        '**/*.json'
      ]
    },
    {
      'files': [
        '**/package.json'
      ],
      'plugins': [
        '@nx',
        '@o3r'
      ],
      'rules': {
        '@o3r/json-dependency-versions-harmonize': ['error', {
          ignoredPackages: ['@o3r/build-helpers'],
          alignPeerDependencies: false
        }],
        '@nx/dependency-checks': ['error', {
          'buildTargets': ['build', 'build-builders', 'compile', 'test'],
          'checkObsoleteDependencies': false
        }]
      }
    },

    {
      'parser': require.resolve('yaml-eslint-parser'),
      'files': [
        '**/*.y{a,}ml'
      ]
    },
    {
      'files': [
        '**/.yarnrc.yml'
      ],
      'plugins': [
        '@o3r'
      ],
      'rules': {
        '@o3r/yarnrc-package-extensions-harmonize': ['error']
      }
    }
  ],
  'env': {
    'es2021': true,
    'browser': true,
    'node': true,
    'webextensions': true,

    'jasmine': true,
    'jest': true,
    'jest/globals': true
  },
  'globals': {
    'globalThis': true
  },
  'settings': {
    'import/resolver': 'node'
  }
};
