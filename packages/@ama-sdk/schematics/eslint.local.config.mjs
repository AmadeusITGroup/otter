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
    name: '@ama-sdk/schematics/language-options',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.builders.json',
          'tsconfig.spec.json',
          'tsconfig.eslint.json',
          'tsconfig.cli.json'
        ]
      }
    }
  }
];
