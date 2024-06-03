# Configuration mechanism

The aim of this document is to help developers to implement `Configuration` inside components, in order to be compliant with the __CMS architecture__.
This will give the possibility to __Business Analysts__ to configure the
application/components.

## Component config types

```

    store config
        │                                                               Input config
        │                                                               (from parent)
        │                   Component default config                          │
        │                      (in config.ts file)                            │
        │                               │                                     │
        │       overrides               │                                     │
        └──────────────────────────────>│                                     │
                                        │                                     │
    global config                       │                                     │
  (no common props)                     │                                     │
        │                               │                                     │
        │                               │                                     │
        │       merge                   │                                     │
        └──────────────────────────────>│                                     │
                                        │                                     │
                                        │                                     │
                                        │           overrides                 │
                                        │<────────────────────────────────────
                                        │
                                        ↓
                                Final component config
```

A component will have to handle different types of configurations.

### Default configuration

- Each __configurable component__ will have a default configuration which will be defined in ``.config.ts`` file associated to the
  component

> [!WARNING]
> The field name 'id' should not be used in the configuration, as we created a unique one for the entity configuration store.

### Configuration coming from config store

- Each __configurable component__ can have a customized config (compliant with the store model). This custom config can be
  asynchronously loaded from a backend server, or it can be injected in the body tag of the app. In both cases, this
  content will be used to update the store.
- If present, it will override the default config. Don't worry about the implementation now, we'll see it later.

### Global config

- The common configuration is the one used in multiple components (it can be a date format, price display, type of input
  form fields from an Angular material input element ...)
- A common configuration is defined in every library. The application common configuration (__global config__) will be
  the result of the __merge of all the common__ configurations.
- The common configuration is __not overridden__ at component type (there will be no properties with the same name in
  common config and components).
- At runtime after the configuration of a component is computed it is extended by global config, so components can use
  fields from global

### Input config

- The configuration of a __component instance__ can be overridden via @Input config

__The priorities for the config__:

- the highest priority is the one passed as input from a parent component
- the second priority is the priority by component id set in the store
- the lowest priority is the default config set on component (in the config.ts file of the component)

## Cases we handle

### Static configuration (override)

- The default configuration is extracted by __@o3r/components:extractor__ and bundled in a JSON file

- From this file we extract and modify the components configurations we want to customize, and we create a new JSON file.

- The content of the new file is injected in the index.html body's data attribute (`data-staticconfig`)

- The value from the data attribute is taken and used to update the configuration store

The big gain here is that the custom config is set up at the bootstrap of the application and available for the
components at their instantiation time

### Dynamic configuration

- The default configuration is extracted by __@o3r/components:extractor__ and bundled in a JSON file which will be exposed in the CMS

- In the CMS plugin the Business Analyst will modify the configuration of components which will be exposed (in the
  server) as dynamic content of the app

- The application will do an HTTP call to get the custom config and inject it in the store.

[!NOTE]
> There is no need to rebuild/redeploy the application to apply these changes.

## Config types lib/app

- At __library__ level we have the config for `Block` and `ExposedComponent`, see [available component types](https://github.com/AmadeusITGroup/otter/blob/main/docs/components/INTRODUCTION.md#component-type).

A block component class should specify __Block__ for __componentType__ in the __O3rComponent__ to be identified by the extractor.
```typescript
@O3rComponent({
  componentType: 'Block'
})
@Component({
  selector: 'o3r-block',
  template: ''
})
export class BlockComponent {}
```

- At application level:

__Page config__ - each page component class should specify __Block__ for __componentType__ in the __O3rComponent__ to be identified by the extractor.
```typescript
@O3rComponent({
  componentType: 'Page'
})
@Component({
  selector: 'o3r-page',
  template: ''
})
export class PageComponent {}
```

__Application config__
The application can have 2 types of configuration depending on the use cases: __pre-bootstrap__ and __runtime (post-bootstrap)__.

Pre-bootstrap config

- Defined in one interface extending the __AppBuildConfiguration__ from __@o3r/core__ in order
  to be identified by the extractor
- Used for configurations needed before loading the Angular app component. They will be
  injected by the CMS in the index.html body tag data-bootstrapconfig as a data attribute

Runtime config

- Defined in one interface which will extend __AppRuntimeConfiguration__  interface available in __@o3r/core__ in order to
  be identified by extractor
- Used as a configuration for the application (ex: Angular material form field appearance global on the app)

## How to develop configuration

> [!NOTE]
> You project needs to depends on `@o3r/configuration`
> To install it run `ng add @o3r/configuration`

### To generate a component with configuration

```shell
ng g component ComponentName --useOtterConfig
```

### To generate configuration in an existing component

```shell
ng g @o3r/configuration:add-config --path="/path/to/the/component/class.component.ts"
```


## Configuration file (*.config.ts)

You need to implement `Configuration`

`NestedConfiguration` is part of @o3r/core package, with only primitive types allowed inside ( string | boolean |
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

> [!WARNING]
> Default config needs to be written AFTER the interface declaration
> and contain no variable references.

> [!NOTE]
> The order for Nested config does not matter.

`UnionTypes` are supported in 2 cases:

1) inline definition (see above `myUnionTypeField`)
2) reference to a union type that is defined in the same configuration file (see above `myReferencedUnionTypeField` and `Position`).

### Configuration tags

To implement this feature, you should add the tags in the JSDoc of the configuration interface while respecting the following format:

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

These tags will be exported inside the extracted metadata (see the [CMS Adapters documentation](../cms-adapters)) provided
they are supported in the [CMS JSON schema](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40o3r/configuration/schemas/configuration.metadata.schema.json). Please refer to the schema for the latest supported model.

For instance, if you want to add a title to your component's configuration as a way to have a user friendly naming and a label for your property, you can set the following JSTags:
```typescript
/**
 * This is an incredible config but the name is not so easy to read for CMS users
 *
 * @title My Incredible Config
 */
export interface MyConfigWithADifficultName extends Configuration {
  /**
   * My great property
   *
   * @label Human readable title
   */
  myConfigProperty: string;
}
```

If you use an unsupported tag in your tsdocs, it will be ignored by the extractor. For instance, in the following example, the `unsupportedTag` will not be part of the extracted metadata.
```typescript
/**
 * Yet another Configuration
 *
 * @unsupportedTag This tag will be ignored by the configuration extractor
 */
export interface MyConfig extends Configuration {
  /**
   * Some description
   */
  someConfigProperty: string;
}
```

### Configuration categories

Categories can be added on configuration properties. This can be achieved by adding the `@o3rCategory` tag in the JSDoc on the configuration property.
The categories added on the configuration properties must be defined either globally or in the configuration interface.

For the first case, the global categories can be defined in the `angular.json` of your project by adding the `globalConfigCategories` property to the options of `@o3r/components:extractor`, for example:

```json5
"extract-components": {
  "builder": "@o3r/components:extractor",
  "options": {
    "globalConfigCategories": [
      { "name": "globalCategory", "label": "Global category" }
    ]
  }
}
```

For the second case, the categories can be described using the `@o3rCategories` tag in the JSDoc on the configuration interface.
Their syntax is the tag `@o3rCategories` followed by the category name and an optional label (if the label is not provided, it will be assigned
the value of the category name with the first letter capitalized, for example `@o3rCategories categoryName` is equivalent to `@o3rCategories categoryName CategoryName`).

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

  /**
   * Propose round trip
   * @o3rCategory globalCategory
   */
  shouldProposeRoundTrip: boolean;
}
```

## Component file (*.component.ts)

### Observable

```typescript
export class MyComponent implements OnChanges, DynamicConfigurable<MyConfig> {
  @Input()
  public config?: Partial<MyConfig>;

  /** Dynamic configuration based on the input override configuration and the configuration service if used by the application */
  private dynamicConfig$: ConfigurationObserver<MyConfig>;

  /** Configuration stream based on the input and the stored configuration */
  public config$: Observable<MyConfig>;

  constructor(
    @Optional() configurationService?: ConfigurationBaseService
  ) {
    this.dynamicConfig$ = new ConfigurationObserver<MyConfig>(MY_CONFIG_ID, MY_DEFAULT_CONFIG, configurationService);
    this.config$ = this.dynamicConfig$.asObservable();
  }

  /** @inheritDoc */
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.config) {
      this.dynamicConfig$.next(this.config)
    }
  }
}
```

### Signal

```typescript
export class MyComponent implements DynamicConfigurableWithSignal<MyConfig> {
  private readonly configurationService = inject(ConfigurationBaseService, { optional: true });

  /** @inheritDoc */
  public config = input<Partial<MyConfig>>();

  /** @inheritDoc */
  public readonly configSignal = configSignal(this.config, MY_CONFIG_ID, MY_DEFAULT_CONFIG, this.configurationService);
}
```
### Application

To use the config mechanism first thing is to inject the config module in our app module

````typescript
import {ConfigurationBaseServiceModule} from '@o3r/configuration';

@NgModule({
  imports: [
    ConfigurationBaseServiceModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: []
})
export class AppModule {
}
````

#### Get and inject dynamic config

````typescript
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private dynamicContentService: DynamicContentService,
    @Optional() private configurationService?: ConfigurationBaseService
  ) {}

  public ngOnInit() {
    if (this.configurationService) {
      this.getDynamicConfig();
    }
  }

  // Example of function which gets the dynamic config (the json config from a server)
  public async getDynamicConfig() {
    const result = await fetch(this.dynamicContentService.getContentPath('global.config.post.json'));
    if (result && result.ok) {
      const json = (await result.json()) as CustomConfig<Configuration>[];

      if (json && json.length && this.configurationService) {
        // Again we use the config service to do all the job of inserting the custom config in the store.
        this.configurationService.computeConfiguration(json);
      }
    } else {
      console.warn('Failed to load Dynamic Config');
    }
  }
}

````

#### Get and inject static config

````typescript
import {ConfigurationBaseService} from '@o3r/configuration';

export class AppComponent implements OnInit, OnDestroy {

  constructor(
    @Optional() private configurationService?: ConfigurationBaseService
  ) {
    this.getStaticConfig();
  }

  // Example of a function which get's the static config fromt he html body tag
  // Again the config service is doing all the job for us
  private getStaticConfig() {
    if (this.configurationService) {
      this.configurationService.getConfigFromBodyTag('staticconfig');
    }
  }
}
````

#### Handle global config

````typescript
import {AREA_1_CONFIG_DEFAULT} from '@scope/area-1';
import {AREA_2_CONFIG_DEFAULT} from '@scope/area-2';
import {ConfigurationBaseService} from '@o3r/configuration';

export class AppComponent implements OnInit, OnDestroy {

  constructor(
    @Optional() private configurationService?: ConfigurationBaseService
  ) {
    this.registerDefaultGlobalConfig();
  }

  // As mentioned above, we have to merge common configs coming from libraries and to pass the result as global config to the store
  // The config service has a method which is doing this
  private registerDefaultGlobalConfig() {
    // Compute the global config based on all common configuration from libraries
    const global = {...AREA_1_CONFIG_DEFAULT, ...AREA_2_CONFIG_DEFAULT};
    this.configurationService.extendConfiguration(global);
  }
}

````

## Naming convention

| Attribute                   | Pattern     |
| --------------------------- | ----------- |
| **Configuration file name** | *.config.ts |
| **Configuration name**      | *Config     |

## Key takeaways

The configuration mechanism is based on the __Store Configuration__ and __Extractors__.

The __Default configuration__ for a component is the one taken from the ``.config.ts`` file associated to that component.

- The config metadata is extracted and computed from the .config.ts file of each component

The __Static configuration__ is the one injected in the index.html of the application.

- The configuration is modified inside the CMS or by hand by implementation teams for example.
- It will be injected as a data attribute on the body tag (data-staticconfig). At bootstrap, the value from the data attribute will be read and the store updated.
- It will override the default configuration

The __Common configuration__ cannot be overridden at component level.

- It extends the computed configuration (default + static) - no override as there should not be properties with the
  same name in the component configs and common

__Dynamic configuration__ is supported thanks to the store

- The configuration is loaded (backend call) at runtime and the store is updated

__Input config__

- Component instance configuration. Ex: To be able to override a configuration field from a subcomponent, the field
  should be bubbled up to the block container. (Only the meaningful configuration fields should be bubbled up).

__Config priorities__ for a component:

- the highest priority is the one passed as input from a parent component
- the second priority is the priority by component id set in the store
- the lowest priority is the default config set on component (in the config.ts file of the component)

## Runtime debugging

### Enable Chrome extension debugging

The Otter framework provides a [Chrome Extension](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) to help debug the application.
To enable the communication between the application and the extension the two following steps are required:

1. Importing the Devtools module into the application AppModule:

```typescript
import { ConfigurationDevtoolsModule } from '@o3r/configuration';

@NgModule({
  imports: [
    ConfigurationDevtoolsModule
  ]
})
export class AppModule { }
```

2. The debug message service needs to be activated

```typescript
import { ConfigurationDevtoolsMessageService } from '@o3r/configuration';

@Component({ ... })
export class AppComponent {
  constructor(configurationMessageService: ConfigurationDevtoolsMessageService) {
    if (IS_DEBUG_MODE) {
      configurationMessageService.activate();
    }
  }
}
```

> __Note__: get more details on [dev tools session](../dev-tools/chrome-devtools.md)
