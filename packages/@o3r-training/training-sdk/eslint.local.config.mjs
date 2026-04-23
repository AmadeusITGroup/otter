import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import {
  ignoreFilesWithGitAttribute,
} from '@o3r/eslint-config/helpers';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  ignoreFilesWithGitAttribute(fileURLToPath(new URL('.gitattributes', import.meta.url)), 'linguist-generated'),
  {
    name: '@o3r-training/training-sdk/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      }
    }
  }
];
