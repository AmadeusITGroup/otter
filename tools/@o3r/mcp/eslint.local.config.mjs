import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default [
  {
    name: '@o3r/mcp/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      },
      globals: {
        ...globals.node,
        NodeJS: true
      }
    }
  },
  {
    name: '@o3r/mcp/ignores',
    ignores: [
      '**/packaged-cli/**'
    ]
  },
  {
    name: '@o3r/mcp/overrides',
    files: ['**/*.ts'],
    rules: {
      'no-console': ['error', { allow: ['error'] }]
    }
  }
];
