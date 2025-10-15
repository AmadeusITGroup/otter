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
    name: '@ama-styling/style-dictionary/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
        tsconfigRootDir: __dirname,
        projectService: true
      }
    }
  }
];
