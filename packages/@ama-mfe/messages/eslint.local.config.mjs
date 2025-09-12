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
    name: '@ama-mfe/messages/projects',
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
  },
  {
    name: '@ama-mfe/messages/messages-definition',
    files: ['**/*.versions.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: null,
          custom: {
            regex: 'V\\d+_\\d+$',
            match: true
          },
          filter: {
            regex: 'Message',
            match: true
          }
        }
      ]
    }
  }
];
