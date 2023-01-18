/* eslint-disable @typescript-eslint/naming-convention */
import noFolderImportForModule from './rules/no-folder-import-for-module/no-folder-import-for-module';
import templateAsyncNumberLimitation from './rules/template-async-number-limitation/template-async-number-limitation';

module.exports = {
  rules: {
    'no-folder-import-for-module': noFolderImportForModule,
    'template-async-number-limitation': templateAsyncNumberLimitation
  },
  configs: {
    '@o3r/no-folder-import-for-module': 'error',
    '@o3r/template-async-number-limitation': 'warn',

    recommended: {
      rules: {
        '@o3r/no-folder-import-for-module': 'error',
        '@o3r/template-async-number-limitation': 'off'
      }
    },

    'template-recommended': {
      rules: {
        '@o3r/no-folder-import-for-module': 'error',
        '@o3r/template-async-number-limitation': 'warn'
      }
    }
  }
};

