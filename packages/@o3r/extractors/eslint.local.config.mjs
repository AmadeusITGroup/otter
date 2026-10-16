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
    name: '@o3r/extractors/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true
      },
      globals: {
        ...globals.node
      }
    }
  },
  {
    name: '@o3r/extractors/package-json',
    files: ['package.json'],
    rules: {
      // The @yarnpkg/core peer range is intentionally capped (<4.9.2) and must not be aligned with the workspace range.
      '@o3r/json-dependency-versions-harmonize': [
        'error',
        {
          alignPeerDependencies: false,
          alignEngines: true,
          ignoredDependencies: [
            '@yarnpkg/core',
            'globby'
          ]
        }
      ]
    }
  }
];
