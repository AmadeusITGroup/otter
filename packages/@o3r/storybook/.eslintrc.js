/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.build.json',
      'tsconfig.builders.json',
      'tsconfig.eslint.json',
      'tsconfig.component-wrapper.json'
    ],
    'sourceType': 'module'
  },
  'extends': [
    '../../../.eslintrc.js'
  ],
  'overrides': [
    {
      'files': [
        '*.{t,j}sx'
      ],
      'parserOptions': {
        'tsconfigRootDir': __dirname,
        'project': [
          'tsconfig.build.react.json',
          'tsconfig.eslint.json'
        ],
        'sourceType': 'module'
      },
      'extends': [
        '../../../.eslintrc.js'
      ]
    },
    {
      'files': [
        '*{.,-}spec.ts'
      ],
      'globals': {
        'globalThis': false
      },
      'env': {
        'browser': true,
        'node': true,
        'es6': true,
        'jest': true
      },
      'parserOptions': {
        'tsconfigRootDir': __dirname,
        'project': [
          'tsconfig.spec.json'
        ]
      },
      'extends': [
        '../../../.eslintrc.js'
      ]
    }
  ]
};
