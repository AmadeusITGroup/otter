import jsonDependencyVersionsHarmonize from './rules/json/json-dependency-versions-harmonize/json-dependency-versions-harmonize';
import noInnerHTML from './rules/template/no-inner-html/no-inner-html';
import templateAsyncNumberLimitation from './rules/template/template-async-number-limitation/template-async-number-limitation';
import matchingConfigurationName from './rules/typescript/matching-configuration-name/matching-configuration-name';
import noFolderImportForModule from './rules/typescript/no-folder-import-for-module/no-folder-import-for-module';
import noMultipleTypeConfigurationProperty from './rules/typescript/no-multiple-type-configuration-property/no-multiple-type-configuration-property';
import o3rCategoriesTags from './rules/typescript/o3r-categories-tags/o3r-categories-tags';
import o3rRestrictionKeyTags from './rules/typescript/o3r-restriction-key-tags/o3r-restriction-key-tags';
import o3rWidgetTags from './rules/typescript/o3r-widget-tags/o3r-widget-tags';
import yarnrcPackageExtensionHarmonize from './rules/yaml/yarnrc-package-extensions-harmonize/yarnrc-package-extensions-harmonize';

module.exports = {
  rules: {
    'no-folder-import-for-module': noFolderImportForModule,
    'no-inner-html': noInnerHTML,
    'template-async-number-limitation': templateAsyncNumberLimitation,
    'o3r-widget-tags': o3rWidgetTags,
    'json-dependency-versions-harmonize': jsonDependencyVersionsHarmonize,
    'matching-configuration-name': matchingConfigurationName,
    'yarnrc-package-extensions-harmonize': yarnrcPackageExtensionHarmonize,
    'no-multiple-type-configuration-property': noMultipleTypeConfigurationProperty,
    'o3r-categories-tags': o3rCategoriesTags,
    'o3r-restriction-key-tags': o3rRestrictionKeyTags
  },
  configs: {
    '@o3r/no-folder-import-for-module': 'error',
    '@o3r/o3r-categories-tags': 'error',
    '@o3r/json-dependency-versions-harmonize': 'error',
    '@o3r/no-multiple-type-configuration-property': 'error',
    '@o3r/template-async-number-limitation': 'warn',
    '@o3r/matching-configuration-name': 'warn',

    recommended: {
      rules: {
        '@o3r/matching-configuration-name': 'error',
        '@o3r/no-multiple-type-configuration-property': 'error',
        '@o3r/no-folder-import-for-module': 'error',
        '@o3r/o3r-categories-tags': 'error',
        '@o3r/template-async-number-limitation': 'off'
      }
    },

    // deprecated: should use `angular-template-recommended` instead. Will be removed in v13.
    'template-recommended': {
      rules: {
        '@o3r/no-folder-import-for-module': 'error',
        '@o3r/template-async-number-limitation': 'warn'
      }
    },

    // deprecated: should use `monorepo-recommended` instead. Will be removed in v13.
    'json-recommended': {
      rules: {
        '@o3r/json-dependency-versions-harmonize': 'error'
      }
    },

    'angular-template-recommended': {
      rules: {
        '@o3r/no-inner-html': 'off',
        '@o3r/template-async-number-limitation': 'error'
      }
    },

    'monorepo-recommended': {
      rules: {
        '@o3r/json-dependency-versions-harmonize': 'error'
      }
    },

    'yarn-recommended': {
      rules: {
        '@o3r/yarnrc-package-extensions-harmonize': 'error'
      }
    }
  }
};
