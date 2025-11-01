import {
  dirname,
  join,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import nxPlugin from '@nx/eslint-plugin';
import o3rConfig from '@o3r/eslint-config';
import o3rTemplate from '@o3r/eslint-config/template';
import o3rPlugin from '@o3r/eslint-plugin';
import {
  defineConfig,
  globalIgnores,
} from 'eslint/config';
import globals from 'globals';
import jsonParser from 'jsonc-eslint-parser';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

const nodeFiles = [
  '**/{builders,cli,schematics,scripts,testing}/**/*.{c,m,}{j,t}s',
  '**/tools/{@o3r,github-actions}/*.{c,m,}{j,t}s',
  '**/*.spec.ts',
  '**/jest.config*.{c,m,}js',
  '**/eslint*.config.mjs'
];

export default defineConfig([
  ...o3rConfig,
  ...o3rTemplate,
  globalIgnores(
    [
      '.cache/**/*',
      '.yarn/**/*',
      '**/dist/',
      '**/dist-*/',
      '**/test/',
      '**/tmp/',
      '**/templates/',
      '**/*.ejs',
      '**/*.template',
      '**/.attachments/',
      '**/generated-doc/',
      '**/packaged-action/',
      '.pnp.js',
      '.vscode',
      '**/src/**/package.json'
    ],
    '@o3r/framework/ignores'
  ),
  {
    name: '@o3r/framework/report-unused-disable-directives',
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  {
    name: '@o3r/framework/settings',
    settings: {
      'import/resolver': {
        node: true,
        typescript: {
          project: join(__dirname, '/tsconfig.base.json')
        }
      }
    },
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 12
    }
  },
  {
    name: '@o3r/framework/setup-jest-files',
    files: ['**/setup-jest.ts'],
    settings: {
      'import/core-modules': ['isomorphic-fetch']
    }
  },
  {
    name: '@o3r/framework/commonjs',
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.commonjs
      }
    }
  },
  {
    name: '@o3r/framework/node',
    files: nodeFiles,
    languageOptions: {
      globals: {
        ...globals.node,
        NodeJS: true,
        globalThis: true
      }
    }
  },
  {
    name: '@o3r/framework/browser',
    files: [
      '**/*.{c,m,}{j,t}s'
    ],
    ignores: nodeFiles,
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },
  {
    name: '@o3r/framework/parser/json',
    files: ['**/*.json'],
    languageOptions: {
      parser: jsonParser
    }
  },
  {
    name: '@o3r/framework/jasmine',
    files: ['**/*{.,-}jasmine.ts'],
    rules: {
      'jest/no-jasmine-globals': 'off'
    },
    languageOptions: {
      globals: {
        ...globals.jasmine
      }
    }
  },
  {
    name: '@o3r/framework/spec',
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off', // required by Jest to mock the imports
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'error'
    }
  },
  {
    name: '@o3r/framework/setup-jest',
    files: ['**/setup-jest.ts', '**/setup-jest.*.ts'],
    rules: {
      'unicorn/no-empty-file': 'off'
    }
  },
  {
    name: '@o3r/framework/package-json',
    files: ['**/package.json'],
    plugins: {
      '@nx': nxPlugin,
      '@o3r': o3rPlugin
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          buildTargets: ['build', 'build-builders', 'compile', 'test'],
          checkObsoleteDependencies: false,
          checkVersionMismatches: false,
          ignoredDependencies: ['ora', '@o3r/test-helpers'],
          ignoredFiles: ['**/*.spec.ts']
        }
      ],
      '@o3r/json-dependency-versions-harmonize': [
        'error',
        {
          ignoredPackages: [
            '@o3r/build-helpers',
            '@o3r/workspace-helpers'
          ],
          alignPeerDependencies: false,
          alignEngines: true
        }
      ]
    }
  },
  {
    name: '@o3r/framework/no-underscore-dangle',
    rules: {
      'no-underscore-dangle': [
        'error',
        {
          allowAfterThis: true,
          allow: [
            '_OTTER_DEVTOOLS_'
          ]
        }
      ]
    }
  },
  {
    name: '@o3r/framework/mjs-files',
    files: ['**/*.m{j,t}s'],
    rules: {
      'no-underscore-dangle': [
        'error',
        {
          allowAfterThis: true,
          allow: ['__filename', '__dirname']
        }
      ]
    }
  },
  {
    name: '@o3r/framework/warn-until-migration-completed',
    files: ['**/*.{m,c,}ts{x,}'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn'
    }
  },
  {
    name: '@o3r/framework/it-tests',
    files: ['**/*.it.spec.ts'],
    rules: {
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['jest-environment', 'jest-environment-o3r-app-folder', 'jest-environment-o3r-type']
        }
      ],
      'import/first': 'off' // We have the jest environment setup first
    }
  }
]);
