/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.build.json',
      'tsconfig.fixture.jasmine.json',
      'tsconfig.fixture.jest.json',
      'tsconfig.builders.json',
      'tsconfig.spec.json',
      'tsconfig.eslint.json'
    ],
    'sourceType': 'module'
  },
  'overrides': [
    {
      'files': [
        '**/package.json'
      ],
      'rules': {
        '@nx/dependency-checks': ['error', {
          'buildTargets': ['build', 'compile', 'test'],
          'ignoredDependencies': ['@o3r/testing'],
          'checkObsoleteDependencies': false
        }]
      }
    }
  ],
  'extends': [
    '../../../.eslintrc.js'
  ]
};
