# Configuration
The component extractor is used to extract the configuration metadata from an application or a library. It extracts the list of all the config interfaces defined
in a library or an application. The output is a JSON file (named `component.config.metadata.json` by default) containing an array of all the component configurations.
It also generates the metadata for component classes and types from an Otter library/application, outputting them in a JSON file (named `component.class.metadata.json` by default).

## How to use it

The Component Extractor is accessible via this [Angular CLI builder](https://angular.io/guide/cli-builder): `@o3r/components:extractor`.

First, define the file names of the package metadata in the `package.json` of the library/application where you run the extractor.
When the extractor is run in a project, it will use these file names to name the output files of the extraction. In case you want to compile the
metadata of the project with its dependencies (generally for an application that has libraries with their own metadata as well), the extractor will need to find the metadata for each dependency.
In that case, the extractor will search for these file names in the `package.json` file of each library (in the `node_modules`)
in order to concatenate the file's metadata with the metadata of other libraries and the application's metadata.

In the `package.json` of the library:
```json
"cmsMetadata": {
  "componentFilePath": "./component.class.metadata.json",
  "configurationFilePath": "./component.config.metadata.json"
}
```

For an up-to-date documentation, run `ng help @o3r/components:extractor`.

* If the __component extractor__ is run on an application with components from an Otter library, the `libraries` option can be used to concatenate the metadata files generated for the application with the ones from the specified libraries.
  The extractor will search for the component configuration and style metadata files in the dependencies of each configured library.
  The name of the metadata files to search for is defined for each library in the `cmsMetadata` property defined in their respective `package.json` files.
* Here is an example of a workspace configuration file (`angular.json` in this case) that contains the `libraries` option:
```json
"extract-components": {
  "builder": "@o3r/components:extractor",
  "options": {
    "tsConfig": "./tsconfig.cms.json",
    "libraries": [
      "@your/o3r-components"
    ]
  }
}
```

> [!WARNING]
> This option will not search for the duplicate configurations in libraries.

The `strictMode` option should be used for production builds, it will throw an error if an inconsistency or error is found in the configuration.
You can set it to `false` to enable the generation of metadata including the unknown types to facilitate troubleshooting, and with the errors logged as warnings.

Here is an example on a library:
```json
"extract-components": {
  "builder": "@o3r/components:extractor",
  "options": {
    "tsConfig": "modules/@scope/area/components/tsconfig.metadata.json",
    "configOutputFile": "modules/@scope/area/components/dist/component.config.metadata.json",
    "componentOutputFile": "modules/@scope/area/components/dist/component.class.metadata.json",
    "strictMode": true
  }
}
```

In case you have a library in a mono repository, it's important to specify both the `configOutputFile` option and the `componentOutputFile` option.
It will prevent the files generated for the library to conflict with the ones generated for the application because by default, if it is not specified, the output files will be generated at the root of the project.

For the `tsconfig`, you should include only the files that you want to parse, i.e. components and config. You can
extend your `tsconfig`, and just override the fields that you need.

Example of a `tsconfig` :

```json5
{
  "extends": "./tsconfig",
  "rootDir": ".",
  "include": [
    "src/**/*.component.ts",
    "src/**/*.config.ts"
  ],
  "exclude": [
    // Put all paths that you would like to exclude here (ex: src/**/*.spec.ts)
  ]
}
```

# Package link

Find the `@o3r/configuration` package [here](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/configuration/README.md).
