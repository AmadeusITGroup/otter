# Configuration
To extract the configuration metadata from an application/library the _component extractor_ will be used. It extracts the list of all the config interfaces defined in a library or application. The output is a json file `component.config.metadata.json` containing an array of all the components configurations (app configs, pages, components).
It will also generate the component classes and types metadata from an Otter library/application, outputting them in a json file `component.class.metadata.json`.   

Note that the component.class.metadata.json is used at the moment only in rules engine scope, but in the future will be a requirement for the next steps of the Adobe SPA Editor.
## How to use it

Since the v3 of Otter, you should use the component-extraction builder directly in your angular.json

First thing to do is to define your given filenames for the configuration in the _package.json_ of the library/app where you run the extractor.  
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
* Here is an example on the otter demo app

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

The __strict mode__ option should be used for production builds, it will throw an error if something not supported by the
cms is found in the config. You can set it to `false` to allow the generation of metadata including the unknown types to
ease issues fixing, and with the errors logged as warnings.

Here is an example on a library

```json
    {
  //...
  "extract-configurations": {
    "builder": "@o3r/components:extractor",
    "options": {
      "tsConfig": "modules/@scope/area/components/tsconfig.metadata.json",
      "configOutputFile": "modules/@scope/area/components/dist/component.config.metadata.json",
      "componentOutputFile": "modules/@scope/area/components/dist/component.class.metadata.json",
      "strictMode": true
    }
  }
  //...
}
```

In case you have a lib in a mono repository, it's important to specify both configOutputFile and componentOutputFile, by
default if not specified, it will be generated at the root of the project

For the tsconfig, you should include only the files that you want to parse, i.e. components, modules and config. You can
extend your tsconfig, and just override the fields that you need.

Example of a tsconfig :

```json
    {
  "extends": "./tsconfig",
  "rootDir": ".",
  "include": [
    "src/**/*.component.ts",
    "src/**/*.module.ts",
    "src/**/*.config.ts"
  ],
  "exclude": [
    "Put all paths that you would like to exclude here ex : src/**/*.spec.ts"
  ]
}
```

## Component file (*.component.ts)

Here is an example of configuration in the component, note that dynamicConfig$ is there for the configuration service
and config$ for the configuration store

```typescript
    // ...
export class MyComponent implements DynamicConfigurable<MyConfig> {
  @Input()
  public config?: Partial<MyConfig>;

  /** Dynamic configuration based on the input override configuration and the configuration service if used by the application */
  private dynamicConfig$: ConfigurationObserver<MyConfig>;

  /** Configuration stream based on the input and the stored configuration */
  public config$: Observable<MyConfig>;

  //...

  constructor(
    // ...
    @Optional() configurationService?: ConfigurationBaseService
  ) {
    this.dynamicConfig$ = new ConfigurationObserver<MyConfig>(MY_CONFIG_ID, MY_DEFAULT_CONFIG, configurationService);
    this.config$ = this.dynamicConfig$.asObservable();
  }

}
```

## Configuration file (*.config.ts)

You need to implement Configuration

NestedConfiguration is part of @o3r/core package, with only primitive types allowed inside ( string | boolean |
number)

OPTIONAL Types NOT supported: they will be ignored by the extractor Here is an example of configuration file containing
all the supported types :

```typescript

/**
 * an UnionType with string values used in configuration (ex: can be reused for several fields)
 */
type Position = 'top' | 'bottom';

/**
 * MyConfig description
 */
export interface MyConfig extends Configuration {
  /**
   * myStringField description
   */
  myStringField: string;

  /**
   * myBooleanField description
   */
  myBooleanField: boolean;

  /**
   * myNumberField description
   */
  myNumberField: number;

  /**
   * myStringListField description
   */
  myStringListField: string[];

  /**
   * myUnionTypeField description
   */
  myUnionTypeField: 'before' | 'after';

  /**
   * myReferencedUnionTypeField description
   */
  myReferencedUnionTypeField: Position;

  /**
   * myNestedField description
   */
  myNestedField: MyNestedConfig[];
}

/**
 * MyNestedConfig description
 */
interface MyNestedConfig extends NestedConfiguration {
  /**
   * myNestedStringField description
   */
  myNestedStringField: string;

  /**
   * myNestedBooleanField description
   */
  myNestedBooleanField: boolean;

  /**
   * myNestedNumberField description
   */
  myNestedNumberField: number;
}

export const MY_DEFAULT_CONFIG: MyConfig = {
  myStringField: 'myStringField default value',
  myBooleanField: false,
  myNumberField: 0,
  myUnionTypeField: 'before',
  myReferencedUnionTypeField: 'top',
  myStringListField: ['firstDefaultValue', 'secondDefaultValue'],
  myNestedField: [
    {
      'myNestedStringField': 'myNestedStringField default value 1',
      'myNestedBooleanField': false,
      'myNestedNumberField': 15
    },
    {
      'myNestedStringField': 'myNestedStringField default value 2',
      'myNestedBooleanField': true,
      'myNestedNumberField': 10
    }
  ]
};
```

Note that the order for the Nested config interface doesn't matter, but the default config needs to be put AFTER the
interface declaration, and contain no variable references.

`UnionTypes` are supported in 2 cases:

1) inline definition (see above `myUnionTypeField`)
2) reference to a union type that is defined in the same configuration file (see above `myReferencedUnionTypeField` and `Position`).

### Configuration tags

Tagging configuration is possible starting otter v4.1. To implement this feature, one should add the tags in the JSDoc
of the configuration interface while respecting the following format:

```typescript
/**
 * MyConfig description
 * @tags [tag1, tag2,
 * tag3]
 *
 */
export interface MyConfig extends Configuration {

}
```

### Configuration categories

Starting Otter v5.2 categories can be added on configuration properties. This can be achieved by adding the `@o3rCategory` tag in the JSDoc on the configuration property.
Moreover, categories can be described using the `@o3rCategories` tag on the configuration interface. Please note that blank lines are not supported for category descriptions - even if the syntax is HTML-like, this text will be interpreted in a JSDoc context.

Example:

```typescript
/**
 * Show the motto on the right of the screen
 *
 * @tags [one, two, three]
 *
 * @o3rCategories presentation configuration linked to display
 * @o3rCategories localization configuration related to languages and translations
 */
export interface SimpleHeaderPresConfig extends Configuration {
  /**
   * Show the motto on the right of the screen
   * @o3rCategory presentation
   */
  showMotto: boolean;

  /**
   * Show language selection dropdown (localization)
   * @o3rCategory localization
   */
  showLanguageSelector: boolean;
}
```

## Troubleshooting

Starting from Otter 3.5 we have strong validators on the metadata output, if you face any issue importing in the CMS,
ensure that you have no warning raised in the cms-adapter run.

You can also check the config causing the issue in your metadata file to see if there is something unusual.
