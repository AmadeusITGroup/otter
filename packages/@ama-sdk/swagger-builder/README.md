# Swagger Builder

Merge and build Swagger 2.0 specifications.

The purpose of the **Swagger Builder** is to take several Swagger specifications as input and to merge them to a single specification.
This will make it possible to implement extensions of Swagger specification or to adapt a Swagger specification to a specific tool (cf. *Amazon Web Service* gateway).

## How to use

Usage of the tools is explained via the `--help` option :

```shell
npx @ama-sdk/swagger-build --help

# Usage: swagger-build [options] [(swagger-spec|api-configuration|npm-package|glob)...]

# Merge swagger spec in inputs. The inputs can be `swagger file`, `api configuration file` or `npm package`

# Options:
#   -V, --version                                      output the version number
#   --apis <path>                                      Path to the files containing a list of APIs to generate. Each APIs will be merged with the ones in argument.
#   -c, --configuration <path>                         Configuration file
#   -o, --output <path>                                Path of the artifact generated (default: "./result/spec")
#   -O, --output-format <yaml|split|json>              Type of artifact generated (default: "yaml")
#   -v, --set-version <version>                        Set the version of the final swagger spec
#   -a, --artifact <name>                              Generate package.json associated to the swagger specification with the given name as artifact name
#   -i, --ignore-conflict                              Ignore the conflict during merge of specifications (the merge will be done in the input order)
#   -u, --set-version-auto                             If enabled, the version from the current package.json will be applied to the final swagger specification
#   --aws-compat                                       Change output to be compatible with AWS
#   --tree-shaking                                     Apply tree shaking on swagger output (enable per default in case of black/white listing)
#   --tree-shaking-strategy <bottom-up|top-down>       Change tree shaking strategy
#                                                      -'bottom-up': recursively remove unused definitions
#                                                      -'top-down': only keep definitions reachable from paths
#                                                      (default: "bottom-up")
#   --no-validation                                    Deactivate bundle validation
#   --flag-definition                                  Flag all definition with a vendor extension x-api-ref: {Definition name}
#   --build-mdk-spec                                   Build the swagger spec to be MDK compliant
#   -h, --help                                         output usage information
```

## Swagger specification in Input

The **Swagger Builder** supports three formats of Swagger specification as inputs:

1. A `yaml` file of a valid `Swagger 2.0` specification
2. A `json` describing a [Split Swagger Specification](https://github.com/AmadeusITGroup/otter/tree/main/docs/swagger-builder/split-swagger-spec.md)
3. A **NPM package** as described in the [referencing](https://github.com/AmadeusITGroup/otter/tree/main/docs/swagger-builder/referencing.md) documentation

The **Swagger Builder** tool will merge all the Swagger specifications entered as arguments (in any of the 3 formats chosen above) from the first entry to the last one as described in the [merging strategy](https://github.com/AmadeusITGroup/otter/tree/main/docs/swagger-builder/merging-strategy.md).

>**Information**: The input support *Glob patterns* to list several files

## Configuration

The **Swagger Builder** supports two kinds of configuration:

1. The configuration via CLI `options` (described in the usage output)
2. The configuration via a `json` file.

The **Swagger Builder** supports a set of *configuration* to configure the merging strategy, the post processing and the output format.

The configurations can be specified in a JSON file following a provided [Json Schema](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/swagger-builder/src/schemas/builder-configuration.schema.json) or via CLI options.
> [!WARNING]
> The CLI Options will **be overridden by** the configuration provided in the JSON file.

### List of available configurations

| Configuration           | CLI Option                             | Description                                                                                                                                                                                                                                                                    | Default value |
|:------------------------|:---------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------|
| **outputFormat**        | **--output-format** (alias: **-O**)    | Type of artifact generated. The supported formats are [split](https://github.com/AmadeusITGroup/otter/tree/main/docs/swagger-builder/split-swagger-spec.md),  `yaml` and `json`                                                                                                                                                                | yaml          |
| **output**              | **--output** (alias: **-o**)           | Path of the artifact generated.<br/> In case of `yaml` (or `json`) output format, the `.yaml` (or `.json`) extension will be added to the path.<br/> In the case of `split` output format, the output path will be the name of the folder containing the generated split spec. | ./result/spec |
| **setVersion**          | **--set-version** (alias: **-v**)      | Set the version of the final Swagger spec. If not specified, the most recent version of the specification (in input) will be used                                                                                                                                              | *null*        |
| **setVersionAuto**      | **--set-version-auto** (alias: **-u**) | If enabled, the version from the current package.json will be applied to the final swagger specification. This option will be ignored if a manual version is specified in **setVersion** configuration.                                                                        | *null*        |
| **artifact**            | **--artifact** (alias: **-a**)         | Name of the NPM artifact associated to the Swagger specification generated. If specified, a `package.json` will be generated alongside the Swagger specification (in the same folder)                                                                                          | *null*        |
| **ignoreConflict**      | **--ignore-conflict** (alias: **-i**)  | Ignore the conflict (in the **paths**) during the specification merging. If enabled, the previous conflicting *path* will be replaced by the new one (in the [Merging strategy](https://github.com/AmadeusITGroup/otter/tree/main/docs/swagger-builder/merging-strategy.md))                                                                   | `false`       |
| **awsCompat**           | **--aws-compat**                       | Enable Amazon Web Service Gateway compatibility. The resulting Swagger specification will be transformed to be compatible with AWS                                                                                                                                             | `false`       |
| **treeShaking**         | **--tree-shaking**                     | Enable the tree shaking of the Swagger output. The `definitions` and `parameters` not referred to by a `path` will be removed. This option is enabled per default in case of black/white listing                                                                               | `false`       |
| **treeShakingStrategy** | **--tree-shaking-strategy**            | Change the tree shaking strategy. Options are `bottom-up` or `top-down`.                                                                                                                                                                                                       | `bottom-up`   |
| **validation**          | **--no-validation**                    | Enable validation of the generated Swagger specification                                                                                                                                                                                                                       | `true`        |
| **flagDefinition**      | **--flag-definition**                  | Flag all definition with a vendor extension x-api-ref: {Definition name}                                                                                                                                                                                                       | `false`       |
| **buildMdkSpec**        | **--build-mdk-spec**                   | Build the swagger spec to be MDK compliant                                                                                                                                                                                                                                     | `false`       |
| **pathsWhiteList**      |                                        | List of whitelisted paths to keep to the final Swagger specification. If specified, the `tree shaking` post process will be run to the Swagger specification                                                                                                                   | *null*        |
| **pathsBlackList**      |                                        | List of blacklisted paths to remove from the final Swagger specification If specified, the `tree shaking` post process will be run to the Swagger specification                                                                                                                | *null*        |
| **specs**               | *CLI Arguments*                        | List of Swagger specification to merge. If both **configuration** and **CLI arguments** are provided the specifications provided as *CLI arguments* will be merged **after** the one from the configuration file                                                               | [ ]           |

### List of additional CLI Options

| Feature           | CLI Option                          | Description                                                                                                                                                 | Default value |
| :---------------- | :---------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| **Configuration** | **--configuration** (alias: **-c**) | [Configuration file](#list-of-available-configurations) to provide parameters to the **Swagger Builder**                                                    | *null*        |
| **APIs**          | **--apis**                          | Path to the files containing a [list of APIs](https://github.com/AmadeusITGroup/otter/tree/main/docs/swagger-builder/multi-apis.md) to generate. Each APIs will be merged with the ones in the CLI argument (if specified). | *null*        |

## Additional Checking tools

To perform validity check of a set of Swagger Specifications, additional tools are provided by the package:

| Name                                                                     | Description                                                                         |
| :----------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| [Dictionary check](https://github.com/AmadeusITGroup/otter/tree/main/docs/swagger-builder/checkers/dictionary-checker.md)                | Validate that the dictionaries linked via the X Vendors are valid                   |
| [Operation ID check](https://github.com/AmadeusITGroup/otter/tree/main/docs/swagger-builder/checkers/operation-id-checker.md)            | Validate that Operation IDs are specified and unique for each paths                 |
| [Multi Success Response check](https://github.com/AmadeusITGroup/otter/tree/main/docs/swagger-builder/checkers/multi-success-checker.md) | Validate that there is no path returning two different success response definitions |

## Generate your own extension

A code generator is provided to generate an API specification extension.

```shell
npx -p @ama-sdk/sdk:api-extension -p @angular-devkit/schematics-cli schematics @ama-sdk/swagger-builder:api-extension <my-extension>
```

> [!TIP]
> Get more details on how to generate an API specification extension [here](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40ama-sdk/schematics/README.md#debug-the-typescript-generator).
