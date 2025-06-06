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
    name: '@o3r/eslint-config/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      }
    }
  },
  {
    name: '@o3r/eslint-config/projects/commonjs',
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: [
          'tsconfig.build.json'
        ]
      },
      globals: {
        ...globals.node,
        NodeJS: true,
        globalThis: true
      }
    }
  }
];
