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
    name: '@o3r/testing/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        NodeJS: true
      }
    }
  },
  {
    name: '@o3r/testing/package-json',
    files: ['package.json'],
    rules: {
      // ts-jest 29 rejects Babel 8, so generated Jest workspaces intentionally receive Babel 7.
      '@o3r/json-dependency-versions-harmonize': [
        'error',
        {
          alignPeerDependencies: false,
          alignEngines: true,
          ignoredDependencies: [
            '@babel/core',
            'globby'
          ]
        }
      ]
    }
  }
];
