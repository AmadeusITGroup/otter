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
    name: '@ama-styling/figma-sdk/ignores',
    ignores: [
      'src/api/',
      'src/models/base/',
      'src/spec/api-mock.ts',
      'src/spec/operation-adapter.ts'
    ]
  },
  {
    name: '@ama-styling/figma-sdk/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      }
    }
  }
];
