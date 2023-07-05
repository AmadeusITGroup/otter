/* eslint-disable @typescript-eslint/naming-convention */
import type { ImportsMapping } from '@o3r/schematics';

/** Map to be used to double check that localization mocks from o3r testing package are well imported from the /localization subentry */
export const mapImportLocalizationMocks: ImportsMapping = {
  '@o3r/testing': {
    TranslatePipeMock: {
      newPackage: '@o3r/testing/localization'
    },
    LocalizationDependencyMocks: {
      newPackage: '@o3r/testing/localization'
    },
    MockTranslations: {
      newPackage: '@o3r/testing/localization'
    },
    mockTranslationModules: {
      newPackage: '@o3r/testing/localization'
    }
  }
};
