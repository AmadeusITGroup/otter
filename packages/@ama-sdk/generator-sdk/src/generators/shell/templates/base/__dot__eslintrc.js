/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'testing/tsconfig.spec.json',
      'tsconfigs/tsconfig.jest.json',
      'tsconfigs/tsconfig.jasmine.json',
      'tsconfigs/tsconfig.source.json'
    ],
    'ecmaVersion': 12
  },
  'env': {
    'browser': true,
    'node': true,
    'es6': true,
    'jasmine': true,
    'jest': true,
    'jest/globals': true
  },
  'settings': {
    'import/resolver': 'node'
  },
  'overrides': [
    {
      'files': [
        '*.{t,j}s'
      ],
      'plugins': [
        'jest'
      ],
      'parser': require.resolve('@typescript-eslint/parser'),
      'extends': ['@o3r/eslint-config-otter'].map(require.resolve)
    },
    {
      'files': ['*.helper.ts'],
      'rules': {
        '@typescript-eslint/explicit-function-return-type': 'error'
      }
    },
    {
      'files': ['*.js'],
      'rules': {
        '@typescript-eslint/restrict-template-expressions': 'off'
      }
    },
    {
      'files': [
        '**/package.json'
      ],
      'rules': {
        '@nx/dependency-checks': ['error', {
          'buildTargets': ['build', 'compile', 'test'],
          'ignoredDependencies': ['minimist'],
          'checkObsoleteDependencies': false
        }]
      }
    }
  ]
};

