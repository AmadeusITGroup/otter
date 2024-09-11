import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

export default [
  {
    name: '@ama-sdk/create/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json'
        ]
      }
    }
  }
];
