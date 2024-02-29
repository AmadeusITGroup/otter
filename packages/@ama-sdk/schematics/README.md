# SDK Generator

This package provides `schematics` generators to create an SDK based on an OpenAPI specifications.
There are two SDK generators in the Otter Framework: Typescript and Java. The Java generator is currently in maintenance
mode and only the Typescript generator is actively supported and will see future evolutions.

- [Typescript SDK](#typescript-sdk)
- [Java SDK](#java-client-core-sdk)

## Typescript SDK

The Typescript SDK generator is a custom template for the OpenAPITools generator with a full integration of the [@ama-sdk/core](https://www.npmjs.com/package/@ama-sdk/core) client capabilities.

It supports both Swagger 2+ and Open API 3 specifications.

- [Setup](#setup)
- [How to use](#how-to-use)
- [Debug](#debug)
- [Going further](#going-further)

### Setup

#### Create a new repository

Generate a new single SDK repository

```shell
npm create @ama-sdk typescript <project-name> -- [--spec-path=./path/to/spec.yaml]
```

or

```shell
yarn create @ama-sdk typescript <project-name> [--spec-path=./path/to/spec.yaml]
```

> [!WARNING]
> Please notice that the command `yarn create` is **not** available for versions *>= 2.0.0*
> (see [Yarn cli commands](https://yarnpkg.com/cli)).

> [!TIP]
> Get more information on the [@ama-sdk/create package](https://www.npmjs.com/package/@ama-sdk/create).

#### Create a new Otter workspace package

The Angular schematics package is required to use these generators:

if you are in an [Otter project](https://github.com/AmadeusITGroup/otter):

```shell
yarn ng add @ama-sdk/schematics
yarn ng add @ama-sdk/core
```

or

```shell
npx -p @angular/cli ng add @ama-sdk/schematics
npx -p @angular/cli ng add @ama-sdk/core
```

### How to use?

The typescript generator provides 2 generators:

- **shell**: To generate the "shell" of an SDK package
- **core**: To (re)generate the SDK based on a specified Swagger spec
- **create**: To create a new SDK from scratch (i.e. chain **shell** and **core**)

To generate the `shell` you can run:

```shell
yarn schematics @ama-sdk/schematics:typescript-shell
```

If you use `Yarn2+`, you can use the following `scripts` in `package.json`:

```json
    "resolve": "node -e 'process.stdout.write(require.resolve(process.argv[1]));'",
    "generate": "yarn schematics @ama-sdk/schematics:typescript-core --spec-path ./swagger-spec.yaml",
    "upgrade:repository": "yarn schematics @ama-sdk/schematics:typescript-shell",
```

Use `generate` to (re)generate your SDK based on the content of `./swagger-spec.yaml` (make sure you have this file at the root of your project) and `upgrade:repository` to regenerate the structure of your project.

#### Light SDK

It is also possible to generate a "light" SDK. This type of SDK does not need to generate revivers, which results in a simplified version of the code and reduces the size of the bundle.

Please note that revivers are generated for SDKs that use:
- non-stringified dates
- dictionaries
- extensible models

##### Dates

If your specification file includes dates, there are multiple options for the generation of your SDK involving the global property option `stringifyDate`:
- By default, the option `stringifyDate` is false so dates will be generated as either `utils.Date`, `utils.DateTime`, or `Date`.
  For more information related to these types, check out this [documentation](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/schematics/schematics/typescript/shell/templates/base#manage-dates).
- To leave the handling of the timezone to the application and generate the dates as `string` types, the option `stringifyDate` can be set to true. <br>
  This can be done by adding `--global-property stringifyDate` to the generator command.
- If an existing SDK contains stringified dates that need to be reverted to their expected formats, you can regenerate the SDK by removing the `stringifyDate` option from the global properties (since it is false by default).

Example to stringify dates:

```shell
yarn schematics @ama-sdk/schematics:typescript-core --spec-path ./swagger-spec.yaml --global-property stringifyDate
```

##### Extensible models

You may be in a case in which you want to be able to extend your SDK models and therefore ensure that revivers are generated
(more info on how to extend a model [here](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/schematics/schematics/typescript/shell/templates/base#how-to-extend-a-model)).
To do this, you can use the global property option `allowModelExtension` by adding `--global-property allowModelExtension` to the generator command.

Example:

```shell
yarn schematics @ama-sdk/schematics:typescript-core --spec-path ./swagger-spec.yaml --global-property allowModelExtension
```

#### Generator Configuration

##### Parameters

It is possible to configure the SDK code generation by passing parameters to the generator command line to override the default configuration values.
The available parameters are:
* `--spec-path`: Path to the swagger specification used to generate the SDK
* `--spec-config-path`: Path to the spec generation configuration
* `--global-property`: Comma separated string of options to give to the openapi-generator-cli
* `--output-path`: Output path for the generated SDK
* `--generator-custom-path`: Path to a custom generator

#### openapitools.json

There is also a possibility to configure the SDK code generation in `openapitools.json`. The structure for this file looks something like this:

```json5
{
  "$schema": "https://raw.githubusercontent.com/OpenAPITools/openapi-generator-cli/master/apps/generator-cli/src/config.schema.json",
  "generator-cli": {
    "version": "0.0.0",
    "storageDir": ".openapi-generator",
    "generators": { // optional
      "example-sdk": { // any name you like (can be referenced using --generator-key)
        "generatorName": "typescriptFetch",
        "output": ".",
        "inputSpec": "./swagger-spec.yaml"
      }
    }
  }
}
```

`example-sdk` corresponds to the key of the generator which can be referenced in the generator command as a parameter, for example:

```shell
yarn schematics @ama-sdk/schematics:typescript-core --generator-key example-sdk
```

The properties `generatorName`, `output`, and `inputSpec` are required and additional properties can be added (available properties described in the schema 
[here](https://github.com/OpenAPITools/openapi-generator-cli/blob/master/apps/generator-cli/src/config.schema.json)). For example, we can add the previously 
described global properties `stringifyDate` and  `allowModelExtension`:

```json
{
  "$schema": "https://raw.githubusercontent.com/OpenAPITools/openapi-generator-cli/master/apps/generator-cli/src/config.schema.json",
  "generator-cli": {
    "version": "0.0.0",
    "storageDir": ".openapi-generator",
    "generators": { 
      "example-sdk": {
        "generatorName": "typescriptFetch",
        "output": ".",
        "inputSpec": "./swagger-spec.yaml",
        "globalProperty": {
          "stringifyDate": true,
          "allowModelExtension": true
        }
      }
    }
  }
}
```

We have added the possibility in the generator command to both specify the generator key and override specific properties of said key.
For example, if we want to use the properties of `example-sdk` from `openapitools.json` but override the global properties we can do so like this:

```shell
yarn schematics @ama-sdk/schematics:typescript-core --generator-key example-sdk --global-property stringifyDate=false
```

> [!CAUTION]
> If the parameter `--generator-key` is provided in combination with other parameters to be overridden, the limitation is that not all
> properties from `openapitools.json` will be taken into account (contrary to the case when there is only the `--generator-key` parameter). 
> As of now, the only properties that will be taken into account are `output`, `inputSpec`, `config`, `globalProperty` which can be
> overridden with the parameters `--output-path`, `--spec-path`, `--spec-config-path`, and `--global-property`.

> [!NOTE]
> The parameter `--generator-custom-path` is not impacted and will always be taken into account if provided.

> [!NOTE]
> The values provided by the parameter `--global-property` will actually be merged with the values of `globalProperty` from
> `openapitools.json` (rather than override them like the other properties).

### Debug

The OpenApi generator extracts an enhanced JSON data model from the specification YAML and uses this data model to feed the templates to generate the code.
If there is an issue with the files generated with the spec provided, the generator provides debugging features that log this data model.

You can use global property options to pass one or both of the following options:
- debugModels - logs the full JSON structure used to generate models
- debugOperations - logs the full JSON structure used to generate operations

Example:

```shell
yarn schematics @ama-sdk/schematics:typescript-core --spec-path ./swagger-spec.yaml --global-property debugModels,debugOperations
```

You can also use npx instead of yarn in the command.

You can correlate this data model with the [templates](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/schematics/schematics/typescript/core/openapi-codegen-typescript/src/main/resources/typescriptFetch) used by the generator.

### Going further

For more information on the generated SDK and how the framework supports different feature such as the Composition, you can refer to the dedicated SDK documentation:

- [Generated SDK hierarchy and extension](https://github.com/AmadeusITGroup/otter/blob/main/docs/api-sdk/SDK_MODELS_HIERARCHY.md)
- [Composition and Inheritance support](https://github.com/AmadeusITGroup/otter/blob/main/docs/api-sdk/COMPOSITION_INHERITANCE.md)

## Java Client Core SDK

> [!WARNING]
> This feature is on maintenance mode and will see no future evolution

Generate a Java Client Core SDK:

Make sure to have a `./swagger-spec.yaml` file at the root of your project and run:

```shell
yarn schematics @ama-sdk/schematics:java-client-core --spec-path ./swagger-spec.yaml --swagger-config-path ./swagger-codegen-config.json
```

[Default swagger config](schematics/java/client-core/swagger-codegen-java-client/config/swagger-codegen-config.json) will be used if `--swagger-config-path` is not provided.
