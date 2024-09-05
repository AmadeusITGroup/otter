const nxPlugin = require('@nx/eslint-plugin');
const {globalSharedConfig} = require('../../eslint.config.js');

module.exports = [
  ...globalSharedConfig,
  {
    name: 'otter-devtools/projects',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.build.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ]
      }
    }
  },
  {
    name: 'otter-devtools/package-json-file',
    files: ['**/package.json'],
    plugins: {
      '@nx': nxPlugin
    },
    rules: {
      '@nx/dependency-checks': ['error', {
        'buildTargets': ['build', 'build-builders', 'compile', 'test'],
        'checkObsoleteDependencies': false,
        'checkVersionMismatches': false,
        'ignoredDependencies': ['ora', '@o3r/test-helpers', '@o3r/schematics']
      }]
    }
  }
];
