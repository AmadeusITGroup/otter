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
    name: '@o3r/dev-tools/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.eslint.json',
          'tsconfig.build.json',
          'tsconfig.builders.json'
        ]
      }
    }
  }
];
