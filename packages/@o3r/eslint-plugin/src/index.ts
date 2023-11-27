/* eslint-disable @typescript-eslint/naming-convention */
import noFolderImportForModule from './rules/typescript/no-folder-import-for-module/no-folder-import-for-module';
import o3rWidgetTags from './rules/typescript/o3r-widget-tags/o3r-widget-tags';
import noInnerHTML from './rules/template/no-inner-html/no-inner-html';
import templateAsyncNumberLimitation from './rules/template/template-async-number-limitation/template-async-number-limitation';
import jsonDependencyVersionsHarmonize from './rules/json/json-dependency-versions-harmonize/json-dependency-versions-harmonize';
import matchingConfigurationName from './rules/typescript/matching-configuration-name/matching-configuration-name';
import noMultipleTypeConfigurationProperty from './rules/typescript/no-multiple-type-configuration-property/no-multiple-type-configuration-property';

module.exports = {
  rules: {
    'no-folder-import-for-module': noFolderImportForModule,
    'no-inner-html': noInnerHTML,
    'template-async-number-limitation': templateAsyncNumberLimitation,
    'o3r-widget-tags': o3rWidgetTags,
    'json-dependency-versions-harmonize': jsonDependencyVersionsHarmonize,
    'matching-configuration-name': matchingConfigurationName,
    'no-multiple-type-configuration-property': noMultipleTypeConfigurationProperty
  },
  configs: {
    '@o3r/no-folder-import-for-module': 'error',
    '@o3r/json-dependency-versions-harmonize': 'error',
    '@o3r/no-multiple-type-configuration-property': 'error',
    '@o3r/template-async-number-limitation': 'warn',
    '@o3r/matching-configuration-name': 'warn',

    recommended: {
      rules: {
        '@o3r/matching-configuration-name': 'error',
        '@o3r/no-multiple-type-configuration-property': 'error',
        '@o3r/no-folder-import-for-module': 'error',
        '@o3r/template-async-number-limitation': 'off'
      }
    },

    'template-recommended': {
      rules: {
        '@o3r/no-folder-import-for-module': 'error',
        '@o3r/template-async-number-limitation': 'warn'
      }
    },

    'json-recommended': {
      rules: {
        '@o3r/json-dependency-versions-harmonize': 'error'
      }
    }
  }
};

