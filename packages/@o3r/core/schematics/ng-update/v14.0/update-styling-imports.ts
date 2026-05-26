import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  updateImports,
} from '@o3r/schematics';

/**
 * Rule to update imports from `@o3r/styling` to the new packages
 * Core interfaces (CssVariable, CssMetadata, CssVariableType) are moved to `@ama-styling/style-dictionary`
 * Devkit interfaces and services are moved to `@ama-styling/devkit`
 */
export const updateStylingImports: Rule = updateImports({
  '@o3r/styling': {
    // Core interfaces moved to `@ama-styling/style-dictionary`
    CssVariable: { newPackage: '@ama-styling/style-dictionary' },
    CssVariableType: { newPackage: '@ama-styling/style-dictionary' },
    CssMetadata: { newPackage: '@ama-styling/style-dictionary' },

    // Devkit interfaces and types moved to `@ama-styling/devkit`
    StylingDevtoolsServiceOptions: { newPackage: '@ama-styling/devkit' },
    UpdateStylingVariablesContentMessage: { newPackage: '@ama-styling/devkit' },
    ResetStylingVariablesContentMessage: { newPackage: '@ama-styling/devkit' },
    StylingVariable: { newPackage: '@ama-styling/devkit' },
    GetStylingVariableContentMessage: { newPackage: '@ama-styling/devkit' },
    StylingMessageDataTypes: { newPackage: '@ama-styling/devkit' },
    AvailableStylingMessageContents: { newPackage: '@ama-styling/devkit' },
    THEME_TAG_NAME: { newPackage: '@ama-styling/devkit' },
    PALETTE_TAG_NAME: { newPackage: '@ama-styling/devkit' },

    // Devkit services and classes moved to `@ama-styling/devkit`
    OtterStylingDevtools: { newPackage: '@ama-styling/devkit' },
    StylingDevtoolsMessageService: { newPackage: '@ama-styling/devkit' },
    StylingDevtoolsModule: { newPackage: '@ama-styling/devkit' },

    // Devkit tokens moved to `@ama-styling/devkit`
    OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS: { newPackage: '@ama-styling/devkit' },
    OTTER_STYLING_DEVTOOLS_OPTIONS: { newPackage: '@ama-styling/devkit' }
  }
});
