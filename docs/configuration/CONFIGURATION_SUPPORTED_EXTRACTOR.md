# Configuration
The component extractor will be used to extract the configuration metadata from an application/library. It extracts the list of all the config interfaces defined in a library or application. The output is a json file `component.config.metadata.json` containing an array of all the components configurations (app configs, pages, components).
It will also generate the component classes and types metadata from an Otter library/application, outputting them in a json file `component.class.metadata.json`.

## How to use it

The Component Extractor is accessible via this NgCLI builder: `@o3r/components:extractor`.

First thing to do is to define your given filenames for the configuration in the `package.json` of the library/app where you run the extractor.
When running in a library it will use this configuration as the names for the metadata files.
When running the extractor in an application, it will search for these filenames in each node_module (package.json file) of each library,
in order to concat the file's metadata with the metadata of other libraries and the application's metadata.

In the package.json of the library
```json
"cmsMetadata": {
  "componentFilePath": "./component.class.metadata.json",
  "configurationFilePath": "./component.config.metadata.json"
}
```

For an up-to-date documentation, run `ng help @o3r/components:extractor`

* If the __component extractor__ is run on an application with components from an Otter library, the ``libraries`` option can be used to concatenate the metadata files generated for the application with the ones from the specified libraries. The extractor will search for the component configuration and style metadata files in the node_modules package of each configured library.
The name of the metadata files to search for is defined for each library in the ``cmsMetadata`` property defined in their respective ``package.json`` file.
* Here is an example of an angular.json file:
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

> [!NOTE]
> This option will not search for the duplicate configurations in libraries.

The `strictMode` option should be used for production builds, it will throw an error if an inconsistency or error is found in the config. You can set it to `false` to allow the generation of metadata including the unknown types to
ease issues fixing, and with the errors logged as warnings.

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

In case you have a library in a mono repository, it's important to specify both `configOutputFile` and `componentOutputFile`. It will prevent the files generated for the library to conflict with the ones generated for the application because by default, if it is not specified, it will be generated at the root of the project.

For the `tsconfig`, you should include only the files that you want to parse, i.e. components and config. You can
extend your tsconfig, and just override the fields that you need.

Example of a tsconfig :

```json
{
  "extends": "./tsconfig",
  "rootDir": ".",
  "include": [
    "src/**/*.component.ts",
    "src/**/*.config.ts"
  ],
  "exclude": [
    "Put all paths that you would like to exclude here ex : src/**/*.spec.ts"
  ]
}
```

