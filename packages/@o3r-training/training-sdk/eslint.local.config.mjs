import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@o3r-training/training-sdk/ignores',
    ignores: [
      'src/api/',
      'src/models/base/',
      'src/spec/api-mock.ts',
      'src/spec/operation-adapter.ts'
    ]
  },
  {
    name: '@o3r-training/training-sdk/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.eslint.json'
        ]
      }
    }
  }
];
