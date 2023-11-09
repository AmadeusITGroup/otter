/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */

module.exports = {
  'root': true,
  'overrides': [
    {
      'files': [
        '*.{t,j}s'
      ],
      'parserOptions': {
        'tsconfigRootDir': __dirname,
        'project': [
          'tsconfig.build.json',
          'tsconfig.spec.json',
          'tsconfig.extension.json',
          'tsconfig.eslint.json'
        ],
        'sourceType': 'module'
      }
    },
    {
      'files': [
        '*.html'
      ],
      'plugins': [],
      'parser': require.resolve('@angular-eslint/template-parser'),
      'extends': [
        '@o3r/eslint-config-otter/template'
      ].map(require.resolve)
    }
  ],
  'extends': [
    '../../.eslintrc.js'
  ]
};
