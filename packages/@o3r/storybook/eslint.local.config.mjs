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
    name: '@o3r/storybook/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.build.react.json',
          'tsconfig.builders.json',
          'tsconfig.component-wrapper.json',
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
