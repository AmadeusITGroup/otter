/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'parserOptions': {
    'projectFolderIgnoreList': [
      '**/templates/**'
    ],
    'tsconfigRootDir': __dirname,
    'project': [
      'tsconfig.build.json',
      'tsconfig.eslint.json',
      'tsconfig.spec.json'
    ],
    'sourceType': 'module'
  },
  // Uncomment when migrating all packages from the monorepo to eslint v9.3
  // 'extends': [
  //   '../../.eslintrc.js'
  // ]
};
