/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.build.json',
      'tsconfig.spec.json',
      'tsconfig.eslint.json'
    ],
    'sourceType': 'module'
  },
  'extends': [
    '../../../.eslintrc.js'
  ],
  'overrides': [
    {
      'files': ['package.json'],
      'rules': {
        '@o3r/json-dependency-versions-harmonize': ['error', {
          'ignoredPackages': ['@o3r/build-helpers', 'yarn'],
          'alignPeerDependencies': false
        }]
      }
    }
  ]
};
