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
    name: '@o3r/palette-generator/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.build.plugin.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json'
        ]
      },
      globals: {
        // TODO: support for flat config https://github.com/figma/eslint-plugin-figma-plugins/issues/28
        figma: 'readonly',
        __html__: 'readonly'
      }
    }
  },
  {
    name: '@o3r/palette-generator/webpack',
    files: ['webpack.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        NodeJS: true,
        globalThis: true
      }
    }
  }
];
