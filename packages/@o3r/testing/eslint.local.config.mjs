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
    name: '@o3r/testing/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.tools.json',
          'tsconfig.schematics.json',
          'tsconfig.build.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ]
      }
    }
  }
];