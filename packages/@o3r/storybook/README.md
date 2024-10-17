<h1 align="center">Otter storybook</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Status](https://img.shields.io/badge/status-deprecated-red?style=for-the-badge)](https://www.npmjs.com/package/@o3r/storybook)
[![Stable Version](https://img.shields.io/npm/v/@o3r/storybook?style=for-the-badge)](https://www.npmjs.com/package/@o3r/storybook)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/storybook?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/storybook)

The Otter Framework provides several tools for Otter based projects.

> [!CAUTION]
> **Deprecated package**
> `@o3r/storybook` package is deprecated and will no longer be updated as of Otter v12.

## Description

The Otter Framework provides 3 sets of tools for Storybook integration:

- **Generators**: To generate basic Story and set up the application to support Storybook
- **Stories helpers**: to create story controllers based on Otter framework
- **AddOns**: to add features to interact with Otter Customization

> These tools are part of the `@o3r/storybook` package

## Setup Storybook support

Otter framework provides 2 mechanisms to setup Storybook on an application/library:

### When starting a new Application/Library

When creating a new application/library (`ng new`), the Otter Framework can be added with the `ng add @o3r/core` command. When executing this command, the following question will be asked: *Add storybook setup?* (default value: `yes`).
If `yes` is chosen, [Storybook mandatory configurations](#storybook-mandatory-configurations) will be automatically added.

### Storybook mandatory configurations

Storybook will require 2 files in the folder `.storybook` added into the root folder of the project.

- **main.js**: partial webpack configuration used by Storybook to build the stories. It is used by Otter to add custom CSS (including theming variables)
- **preview.js**: set of functions and default configurations used by the Storybook before displaying a component preview. This is used by Otter to load metadata (configuration, localization and styling) to set up the component controllers and integrate localization into the display.

> For more documentation regarding the Storybook setup, your can refer to [Storybook documentation](https://storybook.js.org/docs/react/configure/overview).

## Otter AddOns

To facilitate the customization of an Otter component, 2 Storybook Addons are provided.

### Global Theming tab

- ***(1)***: To facilitate the administration of global theming of a component, a tab has been added to the default storybooks tabs.
- ***(2)***: Each global theme variable is editable
- ***(3)***: 3 action buttons are provided
  - Theme switching button (visible only in case of multi theme configured). See [Multi Theme section](#multi-theming).
  - Theme override download button to download the CSS generated from the edited values.
  - Reset button to remove override.

### Exporter

3 different exports are available:

- **Export Theme**: exports global theme as CSS file.
- **Export Configuration**: exports component configuration as JSON file.
- **Export Component style**: exports component variable override as CSS file.

## Stories Helpers

Otter provides 3 helpers to generate automatically the component controllers.
Each helper should be used in both `preview.js` to initialize the value and in `<component>.stories.ts` file to retrieve the value.

| Setter (in preview.js)                                             | Setter parameter(s)                                                                                                                             | Extractor (in stories)                                                                     | Extractor Parameter(s)                                                                                                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **setStyleMetata**: register styling metadata                      | *styling metadata* extracted by `@o3r/styling` from the application/library.<br />In case of library, a default theme should be provided | **extractStyling**: retrieve styling variable configuration for the component              | *component selector* used as CSS variable name prefix in the component                                                                               |
| **setConfiguratiobnMetadata**: register the configuration metadata | *configuration metadata* extracted by `@o3r/configuration` from the application/library.                                                       | **extractConfiguration**: retrieve dynamic configuration's configuration for the component | *library name*: name of the current library/component which the component is attached to.<br />*component name*: class name of the current component |
| **setLocalizationMetadata**: register the localization metadata    | *localization metadata* extracted by `@o3r/localization` from the application/library.                                                         | **extractLocalization**: retrieve full localization configuration for the component        | *translation*: current component translations map                                                                                                    |

> Find documentation to write a story on [Storybook documentation](https://storybook.js.org/docs/react/writing-stories/introduction).

## Additional features

### Multi theming

The Theme Addon is supporting multi theme and allows the user to switch from one theme to another.
The list of themes should be provided as [global parameter](https://storybook.js.org/docs/writing-stories/parameters#global-parameters) with a key/value map:

```typescript
import { getThemeVariables, setStyleMetadata } from '@o3r/storybook';

// metadata extracted from my application
import defaultStyleMetadata from '../dist/style.metadata.json';
// metadata extracted from another theme of my application (will contains only the variable relative to this custom theme)
import customStyleMetadata from '../dist/style.metadata.json';

// registers my application default style metadata
setStyleMetadata({defaultStyleMetadata});


export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  themes: {
    // the function getThemeVariables() will extract, from metadata, only the CSS variable provided by the global theme, as key/value map
    // sets as default theme the map of the default theme css variable
    default: getThemeVariables(),
    // adds additional theme by providing the map of css variable extracted from the custom theme
    custom: getThemeVariables(customStyleMetadata)
  }
}
```
