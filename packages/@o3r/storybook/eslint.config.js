const {globalSharedConfig} = require('../../../eslint.config.js');
const globals = require('globals');

module.exports = [
  ...globalSharedConfig,
  {
    name: '@o3r/storybook/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.builders.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json'
        ]
      }
    }
  },
  {
    name: '@o3r/storybook/react',
    files: [
      '*.{t,j}sx'
    ],
    parserOptions: {
      tsconfigRootDir: __dirname,
      project: [
        'tsconfig.build.react.json',
        'tsconfig.eslint.json'
      ],
      sourceType: 'module'
    }
  },
  {
    name: '@o3r/storybook/spec/globals',
    files: [
      '*{.,-}spec.ts'
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es6,
        globalThis: true
      },
      ecmaVersion: 12,
      sourceType: 'commonjs',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['tsconfig.spec.json']
      }
    }
  }
];
