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
          'tsconfig.app.json',
          'tsconfig.eslint.json',
          'tsconfig.spec.json'
        ],
        'sourceType': 'module'
      },
      'rules': {
        '@o3r/o3r-widget-tags': [
          'error',
          {
            'DESTINATION_ARRAY': {
              'minItems': {
                'type': 'number'
              },
              'allDestinationsDifferent': {
                'type': 'boolean'
              },
              'atLeastOneDestinationAvailable': {
                'type': 'boolean'
              },
              'destionationPattern': {
                'type': 'string'
              }
            }
          }
        ]
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
