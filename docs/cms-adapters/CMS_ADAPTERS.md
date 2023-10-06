# Otter CMS adapters
Extract and generate Otter related data to integrate with a cms

## Extractors

### Component metadata extractor
Extracts the component classes and types metadata from an Otter library/application, outputting them in a json file `component.class.metadata.json`.   
It will also generate the list of all the config interfaces defined in a library or application. The output is a json file `component.config.metadata.json` containing an array of all the components configurations (app configs, pages, components).

* If you run the extractor on an application, you have to make sure that the application configuration interface extends '_AppRuntimeConfiguration_' or '_AppBuildConfiguration_' form __@o3r/core__, in order to be identified by the extractor as application configuration.
* You have to specify a _tsconfig.json_ file to include/exclude the files needed in the extraction process

#### How to install

```bash
yarn ng add @o3r/components
```
or
```bash
npx ng add @o3r/components
```

#### How to use

First thing to do is to define your given filenames for the classes/configuration in the _package.json_ of the library/app where you run the extractor.  
When running in a library it will use this configuration as the names for the metadata files.  
When running the extractor in an application, it will search for these filenames in each node_module (package.json file) of each library,  
in order to concat the metadata from the file with other libraries metadata and app metadata. 

```
// in package.json file
...
  "cmsMetadata": {
    ...
    "componentFilePath": "./component.class.metadata.json",
    "configurationFilePath": "./component.config.metadata.json",
  }
...
```

The Component Extractor is accessible via a NgCLI builder: `@o3r/components:extractor`;

For an up-to-date documentation, run `ng help @o3r/components:extractor`

* If the _component extractor_ is run on an application which is using components from an otter library, the _libraries_ option can be specified to concat classes/configuration files generated for application with ones from specified _libraries_. The extractor will search a _'component.config.metadata.json'_ and a _component.class.metadata.json_ file in the node_modules package of each defined library (the name of the files to search will be read from the _cmsMetadata_ property in _package.json_ file defined for each library).  

```
// in angular.json  
"extract-components": {
  "builder": "@o3r/components:extractor",
  "options": {
    "tsConfig": "./tsconfig.cms.json",
    "libraries": [
      "@your/o3r-components"
    ]
  }
},
```

__Note:__ This options will not search for the duplicate configurations in libraries.

### Localization extractor
Generates a metadata file that contains all the localized strings that are used in the application.
* You have to specify a _tsconfig.json_ file to include/exclude the files needed in the extraction process

#### How to install

```bash
yarn ng add @o3r/localization
```
or
```bash
npx ng add @o3r/localization
```

#### How to use

First thing to do is to define your given filename for the localisation in the _package.json_ of the library/app where you run the extractor.  
When running in a library it will use this configuration as the default name for the metadata file.  
When running the extractor in an application, it will search for this filename defined in each node_module (package.json file) of each library, in order to concat the metadata from the file with other libraries metadata and app metadata. 

```
// in package.json file
...
  "cmsMetadata": {
    ...
    "localizationFilePath": "./localisation.metadata.json",
  }
...
```

The Localization Extractor is accessible via a NgCLI builder: `@o3r/localization:extractor`;

For an up-to-date documentation, run `ng help @o3r/localization:extractor`

* _--ignore-duplicate-keys_ option ca be specified in order to not fail the extraction process if duplicate keys are found. Also, the duplicate keys will be removed from the bundle keeping the first one found.
* If the _localisation extractor_ is run on an application, _libraries_ option can be specified to concat keys found in application files with the ones from specified _libraries_. The extractor will search a _'localisation.metadata.json'_ file in the node_modules package of each specified library (the file defined in the package.json of the library).  

```
// in angular.json
"extract-translations": {
  "builder": "@o3r/localization:extractor",
  "options": {
    "tsConfig": "./tsconfig.cms.json",
    "libraries": [
      "@your/o3r-components"
    ]
  }
},
```

### Style extractor
Generates a metadata file that contains all the CSS Variable that are used in the application.

#### How to install

```bash
yarn ng add @o3r/styling
```
or
```bash
npx ng add @o3r/styling
```

#### How to use

First thing to do is to define your given filename for the style in the _package.json_ of the library/app where you run the extractor.  
When running in a library it will use this configuration as the default name for the metadata file.  
When running the extractor in an application, it will search for this filename defined in each node_module (package.json file) of each library, in order to concat the metadata from the file with other libraries metadata and app metadata. 

```
// in package.json file
...
  "cmsMetadata": {
    ...
    "styleFilePath": "./style.metadata.json",
  }
...
```

The Style Extractor is accessible via a NgCLI builder: `@o3r/styling:extractor`;

For an up-to-date documentation, run `ng help @o3r/styling:extractor`

* _--filePatterns_ option can be specified in order to provide a list of glob patterns to get the scss files to extract the metadata from.
* If the _style extractor_ is run on an application, _--libraries_ option can be specified to concat keys found in application files with the ones from specified _libraries_. The extractor will search a _'style.metadata.json'_ file in the node_modules package of each specified library.
* The option _--outputFile_ is used to specify the output metadata file name is different of _'style.metadata.json'_.
* A _--watch_ option can be specified to turn the metadata generator to watch mode.
* The output metadata file can be minimized using the _--inline_ option to indicate that the generated JSON file have to be minified.

__Note:__ The duplicate CSS Variable will be specified as warning and overridden by the latest key received.

### Rules engine extractor

### Metadata

As for the other metadata retrieved, a bit of configuration is needed in order to extract metadata for facts and operators in rules engine scope.

#### How to install

```bash
yarn ng add @o3r/rules-engine
```
or
```bash
npx ng add @o3r/rules-engine
```

#### How to use
In _angular.json_ of the app a new build architect needs to be added.
Here is an example:  
```JSON
// angular.json
  ...
  "extract-rules-engine": {
    "builder": "@o3r/rules-engine:extractor", // otter cms adapters builder
    "options": {
      "tsConfig": "./tsconfig.cms.json", // ts config file used by the builder
      "libraries": [ // libraries containing facts included in the app
        "@your/rules-engine-fact"
      ],
      "factFilePatterns": [ // custom facts files
        "src/facts/**/*.facts.ts"
      ]
    }
  },
``` 

Now that the new builder step is added, it has to be referenced in `package.json` file, alongside other metadata extraction scripts.

```JSON
// package.json
...
  "scripts": {
    ...
    "cms-adapters:rules-engine": "ng run your-o3r-app:extract-rules-engine",
    "cms-adapters:metadata": "yarn cms-adapters:components && yarn cms-adapters:localizations && yarn cms-adapters:style && yarn cms-adapters:rules-engine", 
  }
```

#### How to validate

In your json object you can add a property `$schema` to validate the content of the json object.

Example:
```json
{
  "$schema": "https://raw.githubusercontent.com/AmadeusITGroup/otter/main/packages/@o3r/application/schemas/functional-content.metadata.schema.json",
  ...
}
```
