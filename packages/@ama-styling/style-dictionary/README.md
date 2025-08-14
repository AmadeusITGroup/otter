<h1 align="center">Otter Style Dictionary</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@ama-styling/style-dictionary?style=for-the-badge)](https://www.npmjs.com/package/@ama-styling/style-dictionary)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-styling/style-dictionary?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-styling/style-dictionary)

This package exposes a set of **Hooks** and **Modules** for the [Style Dictionary](https://styledictionary.com/) to enhance the capabilities of Design Tokens.

## Get Started

Set up your [Style Dictionary](https://styledictionary.com/) in your project thanks to the command:

```shell
ng add @ama-styling/style-dictionary
```

By default, the command will do the following updates:

- Add a dev dependency to the [Style Dictionary package](https://www.npmjs.com/package/style-dictionary).
- Create a minimal [config.mjs](https://styledictionary.com/reference/config/#_top) configuration file with the required setup for CSS and Metadata generation.
- Add the `generate:theme` and `generate:metadata` scripts in the project *package.json*.

You will then be able to customize this setup with your project's specifications:

- Customize the [Style Dictionary configuration](https://styledictionary.com/reference/config/#_top) in the generated *config.mjs* file.
- Add [extensions](https://tr.designtokens.org/format/#extensions) to your source Design Token via the [enhancement mechanism](#enhancement).
- Configure output files thanks to the [`getTargetFiles` helper](#gettargetfiles).

## Enhancement

### Design Token Extensions

The [Design Tokens](https://tr.designtokens.org/format/#extensions) format allows to provide the `$extensions` property to enhance the Token it is applied to.\
The property can be applied to the Token directly as follows:

```json5
// colors.token.json
{
  "colors": {
    "primary": {
      "$value": "#000000",
      "$extensions": {
        "o3rPrivate": true
      }
    }
  }
}
```

or in a dedicated `.extensions.json` file (when the [o3r/json-parser/extensions](#parsers) parser is loaded):

```json5
// color.token.json
{
  "colors": {
    "primary": {
      "$value": "#000000"
    }
  }
}
```

```json5
// custom.extensions.json
{
  "colors.primary": {
    "$description": "Primary private color",
    "$extensions": {
      "o3rPrivate": true
    }
  }
}
```

### Available Otter Extensions

| Extensions        | Type                                                                                                                                            | Description                                                                                                                                                                                                                                                                                         | Required hooks                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| o3rPrivate        | `boolean`                                                                                                                                       | Determine if the token is flagged as private                                                                                                                                                                                                                                                        | pre-processor: **o3r/pre-processor/extensions** <br />formatter: **o3r/css/variable**     |
| o3rImportant      | `boolean`                                                                                                                                       | Determine if the token should be flagged as important when generated                                                                                                                                                                                                                                | pre-processor: **o3r/pre-processor/extensions** <br />formatter: **o3r/css/variable**     |
| o3rScope          | `string`                                                                                                                                        | Scope to apply to the generated variable                                                                                                                                                                                                                                                            | pre-processor: **o3r/pre-processor/extensions** <br />formatter: **o3r/css/variable**     |
| o3rMetadata       | [CMS Metadata](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40ama-styling/style-dictionary/src/interfaces/style-dictionary.interface.mts) | Additional information to provide to the metadata if generated                                                                                                                                                                                                                                      | pre-processor: **o3r/pre-processor/extensions** <br />formatter: **o3r/json/metadata**    |
| o3rUnit           | `string`                                                                                                                                        | Convert a numeric value from the specified unit to the new unit. It will add a unit to the tokens of type \"number\" for which the unit is not specified.<br />In the case of complex types (such as shadow, transition, etc...), the unit will be applied to all numeric types they contain.       | pre-processor: **o3r/pre-processor/extensions** <br />transforms: **o3r/transform/unit**  |
| o3rRatio          | `number`                                                                                                                                        | Ratio to apply to the previous value. The ratio will only be applied to tokens of type \"number\" or to the first numbers determined in \"string\" like types.<br />In the case of complex types (such as shadow, transition, etc...), the ratio will be applied to all numeric types they contain. | pre-processor: **o3r/pre-processor/extensions** <br />transforms: **o3r/transform/ratio** |
| o3rExpectOverride | `boolean`                                                                                                                                       | Indicate that the token is expected to be overridden by external rules                                                                                                                                                                                                                              | pre-processor: **o3r/pre-processor/extensions**                                           |

> [!WARNING]
> The **required hooks** need to be registered to the [Style Dictionary configuration](https://styledictionary.com/reference/config/) to fully support the extension.

## Modules

### [Parsers](https://styledictionary.com/reference/hooks/parsers/)

| Name                           | Matching files         | Description                                                                      |
| ------------------------------ | ---------------------- | -------------------------------------------------------------------------------- |
| o3r/json-parser/one-line-token | `**/*.json`            | Allow *dot notation* Token in JSON file                                          |
| o3r/json-parser/extensions     | `**/*.extensions.json` | Parse file containing `$extensions` instructions to apply on top of Design Token |

### [Pre-processor](https://styledictionary.com/reference/hooks/preprocessors/)

| Name                         | Description                                                                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| o3r/pre-processor/extensions | Pre-processor to add the support of the `$extensions` instructions in the Token (or dedicated `extensions.json` file). This pre-processor is mandatory for any Otter hooks. |

### [Transforms](https://styledictionary.com/reference/hooks/transforms/)

| Name                | Type    | Criteria                         | Description                                                                             |
| ------------------- | ------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| o3r/transform/ratio | `value` | `o3rRatio` extension is provided | Apply the given `o3rRatio` to the numeric values of the Token(s) it refers to.          |
| o3r/transform/unit  | `value` | `o3rUnit` extension is provided  | Replace the unit of the values of the Token(s) it refers to, by the provided `o3rUnit`. |

### [Transform-groups](https://styledictionary.com/reference/hooks/transform-groups/)

| Name                | Description                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| o3r/css/recommended | Extend the official [CSS transform groups](https://styledictionary.com/reference/hooks/transform-groups/predefined/#css) by adding `o3r/transform/ratio` and `o3r/transform/unit` |

### [Formats](https://styledictionary.com/reference/hooks/formats/)

| Name              | Options                                                                                                                                 | Description                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| o3r/css/variable  | See [css/variables options](https://styledictionary.com/reference/hooks/formats/predefined/#cssvariables)                               | Render CSS variable block (based on the [built-in format](https://styledictionary.com/reference/hooks/formats/predefined/#cssvariables)) supporting additional [Otter Extensions features](#enhancement). |
| o3r/json/metadata | See [css/variables options](https://styledictionary.com/reference/hooks/formats/predefined/#cssvariables) *(applied to `defaultValue`)*<br />- **keepPrivate**: include private variables | Render [CMS style metadata](https://github.com/AmadeusITGroup/otter/blob/main/docs/styling/THEME.md).                                                                                                     |

### Registration process

The different hooks/modules can be registered individually via the different [register...()](https://styledictionary.com/getting-started/using_the_npm_module/) functions from `StyleDictionary` or all at once with the `register` function as follows:

```typescript
import { register, baseConfig } from '@ama-styling/style-dictionary';

const sd = new StyleDictionary({
  ...baseConfig,
  // custom configs ...
});

register(sd); // Register all Otter modules
```

> [!IMPORTANT]
> To be able to use any of the listed modules/hooks, they have to be registered to the `StyleDefinition` instance.

> [!TIP]
> The helper `baseConfig` will provide the minimal configuration for Otter extension support.

### Helpers

To enhance and facilitate the configuration of the `StyleDictionary` instance, the `@ama-styling/style-dictionary` exposes a set of helpers.

#### getTargetFiles

The `getTargetFiles` function is used to parameterize the generated file based on Design Token (following the same logic as `$extensions`):

```javascript
// Example to generate the `color-primary-**` variables in `my-color-primary.css`

import { getTargetFiles } from '@ama-styling/style-dictionary';

const rule = {
  'color.primary': 'my-color-primary.css'
};

// or `const rule = {color: {primary: 'my-color-primary.css'}}`
// or `const rule = {'color.primary': {$extensions: {o3rTargetFile: 'my-color-primary.css'}}}`
// or `const rule = {'color: {primary': {$extensions: {o3rTargetFile: 'my-color-primary.css'}}}}`

const sd = new StyleDictionary({
  //...
  plateforms: {
    css: {
      files: [
        ...getTargetFiles({ rule, { format: 'css', defaultFile: 'default-file.css' } })
      ]
    }
  }
});

register(sd); // Register all Otter modules
```

> [!NOTE]
> The `format` option will be applied to all the files provided to the `getTargetFiles` function (including `defaultFile`).
> `defaultFile` defines the default file where variables not matching any rule will be generated.

The helper function `getTargetFiles` is registering the filter into `StyleDictionary` with a unique ID.\
This IDs can be retrieved as follows:

```javascript
import { getTargetFiles } from '@ama-styling/style-dictionary';

const sd = new StyleDictionary();
const files = getTargetFiles({ rules, { styleDictionary: sd } });

/**
 * Filter IDs registered in {@link sd} Style Dictionary instance
 * @type {string[]}
 **/
const filterIds = files.map(({ filter }) => filter);
```

## Advanced

### Basic Node Configuration Example

```typescript
// style-builder.mjs

import { register, getTargetFiles, baseConfiguration } from '@ama-styling/style-dictionary';
import StyleDictionary from 'style-dictionary';

// Rules to generate different CSS files according to Token name
const fileRules = {
  colors: 'style/colors.tokens.css',
  'components.panel': 'components/panel/panel.tokens.css'
}

const sd = new StyleDictionary({
  ...baseConfiguration, // Use basic Otter configuration setup
  usesDtcg: true, // Use Design Token Standard format

  source: ['tokens/*.tokens.json'], // Design Token files
  include: ['token.extensions.json'], // Custom extensions

  platforms: {
    // Generate CSS Files
    css: {
      options: {
        outputReferences: true // to output `--var: var(--other-var)` instead of the value of `--other-var`
      },
      transformGroup: 'o3r/css/recommended',
      files: [
        ...getTargetFiles(fileRules, { format: 'css' }),
        // default CSS file where generate variables
        { destination: 'style/default.tokens.css', format: 'css' }
      ]
    },
    cms: {
      options: {
        outputReferences: true
      },
      transformGroup: 'o3r/css/recommended',
      files: [
        { destination: 'style.metadata.json', format: 'o3r/json/metadata' }
      ]
    }
  }
});

// Register otter hooks/modules
register(sd);

if (process.env.CSS_ONLY){
  sd.buildPlatform('css');
} else {
  sd.buildAllPlatforms();
}
```

Can be run with the following command:

```bash
node ./style-builder.mjs
```
