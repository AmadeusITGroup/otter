import {
  dirname
} from 'node:path';
import {
  fileURLToPath
} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: 'audit-gh-action/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.json',
          'tsconfig.eslint.json'
        ]
      }
    }
  },
  {
    name: 'audit-gh-action/ignores',
    ignores: [
      '**/packaged-action/**'
    ]
  }
];
