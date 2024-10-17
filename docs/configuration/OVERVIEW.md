# Configuration mechanism

The aim of this document is to help developers to implement configurability in a library or an application.

You may need configurability if you are developing components that can have different behaviors or displays depending on who is using them or how.
Let's take the example of a library with calendar components used by many projects all around the world.
Depending on their culture, some users may want a Gregorian Calendar, others may need the Lunar one.
You will probably want to make your component configurable at least at build time to meet everyone's needs.

Now let's imagine the same use case, not for a library, but for an application. You need to implement some sort of runtime configurability to meet
everyone's needs. That is the purpose of Otter's Configuration pattern.

In this documentation, you will learn how to implement this pattern and how to extract metadata that will describe how your project can be configured.
The JSON metadata can be used to build your own override application, or as an input for a generic configuration UI (CMS), for example.

## Component configuration types

```
  Customized config
        │                                                               Input config
        │                                                               (from parent)
        │                   Component default config                          │
        │                      (in config.ts file)                            │
        │                               │                                     │
        │       overrides               │                                     │
        └──────────────────────────────>│                                     │
                                        │                                     │
    Global config                       │                                     │
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

- Each __configurable component__ will have a default configuration which will be defined in the `.config.ts` file associated to the component

> [!WARNING]
> The field name `id` should not be used in the configuration, as we use this field in our internal implementation.

### Customized configuration

- Each __configurable component__ can have a customized configuration, which can be asynchronously loaded from a backend server
  or injected in the body tag of the app.
- If present, it will override the default configuration. Don't worry about the implementation now, we'll see it later.

### Global configuration

- The __common configuration__ is the one used in multiple components. It can be a date format, a price display, the appearance of an Angular component, etc.
- A common configuration is defined in every library. The application's common configuration (__global configuration__) will be
  the result of the __merge of all the common__ configurations.
- The common configuration is __not overridden__ at component type (there will be no properties with the same name in
  common configuration and components).
- At runtime, after the configuration of a component is computed, it is extended by the global configuration, so components can use
  fields from the global configuration. (An example of this is available [below](#handle-global-config).)

### Input configuration

- The configuration of a __component instance__ can be overridden via `@Input` configuration.

## How to set up the configuration service

We support two ways of setting up the configuration service (`ConfigurationBaseService`). It can be at the bootstrap of the
application for a static configuration or at any time during application execution for a dynamic configuration. 

### Static configuration (override)

- The default configuration is extracted by the __@o3r/components:extractor__ and bundled in a JSON file.

- From this file, we extract and modify the component's configurations we want to customize, and we create a new JSON file.

- The content of the new file is injected in the `index.html` body's data attribute (`data-staticconfig`).

- The value from the data attribute is taken and passed to the configuration service.

The big gain here is that the custom configuration is set up at the bootstrap of the application and available for the
components when they are instantiated.

### Dynamic configuration

- The default configuration is extracted by __@o3r/components:extractor__ and bundled in a JSON file. You may have a CMS (your own or a plugin) 
  that would take this configuration metadata as an input. For example, if you have a CMS plugin, you can expose the JSON file in this plugin.

- In the configuration UI, the Business Analyst will modify the configuration of components which will be exposed (in the server) as dynamic content of the app.

- The application will do an HTTP call to get the custom configuration and override the default configuration via the configuration service.

> [!NOTE]
> There is no need to rebuild/redeploy the application to apply these changes.

## Configuration types library/application

- At __library__ level, we have the configuration for `Block`, `Component` and `ExposedComponent`, see [available component types](https://github.com/AmadeusITGroup/otter/blob/main/docs/components/INTRODUCTION.md#component-type).

A block component class should specify `'Block'` for `componentType` in the `@O3rComponent` decorator to be identified by the extractor.
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

- At __application__ level:

__Page configuration__: Each page component class should specify `'Page'` for `componentType` in the `@O3rComponent` decorator to be identified by the extractor.
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

__Application configuration__: The application can have 2 types of configurations depending on the use cases: __pre-bootstrap__ or __runtime (post-bootstrap)__.

__Pre-bootstrap configuration__

- Defined in one interface extending the `AppBuildConfiguration` from __@o3r/core__ in order to be identified by the extractor.
- Used for configurations needed before loading the Angular application component.

__Runtime configuration__

- Defined in one interface that extends the `AppRuntimeConfiguration`  interface available in __@o3r/core__ in order to
  be identified by the extractor.
- Used as a configuration for the application (ex: global appearance of the Angular material component in the application)

## How to develop configuration

> [!NOTE]
> Your project needs to depend on `@o3r/configuration`.
> To install it, run `ng add @o3r/configuration`.

### To generate a component with configuration

```shell
ng g component ComponentName --use-otter-config
```

### To generate configuration in an existing component

```shell
ng g @o3r/configuration:add-config --path="/path/to/the/component/class.component.ts"
```


## Configuration file (*.config.ts)

You need to implement `Configuration` in the dedicated file of the component (`*.config.ts`).
The configuration should extend the interface of the configuration that is supported by the extractor.

> [!NOTE]
> The Otter VSCode extension offers a command to add configuration to an existing component. To do so, right-click a component file (ending with *.component.ts),
> select "Enrich Otter component", then the option "Add configuration to component".

It can also contain nested configurations which need to extend `NestedConfiguration`. 
This interface is part of the @o3r/core package, with only primitive types allowed inside (string | boolean | number) or an array of primitive types.

OPTIONAL types are NOT supported and will be ignored by the extractor.
Here is an example of a configuration file containing all the supported types:

```typescript

/**
 * a UnionType with string values used in configuration (ex: can be reused for several fields)
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
> The default configuration const needs to be explicitly typed with the configuration interface and contain no variable references.
> The const needs to be defined after the interface.

> [!NOTE]
> The order for NestedConfiguration does not matter.

`UnionTypes` are supported in 2 cases:

1) inline definition (see above `myUnionTypeField`)
2) reference to a union type that is defined in the same configuration file (see above `myReferencedUnionTypeField` and `Position`).

### Configuration tags

To implement this feature, you should add the tags in the JSDoc of the configuration interface while respecting the correct format, for example:

```typescript
/**
 * MyConfig description
 * @tags [tag1, tag2, tag3]
 */
export interface MyConfig extends Configuration {

}
```

> [!NOTE]
> We also support the multiline format for the tags, for example:
> ```typescript
> /**
>  * MyConfig description
>  * @tags [
>  *   tag1,
>  *   tag2,
>  *   tag3
>  * ]
>  */
> ```

These tags will be exported inside the extracted metadata (see the [CMS Adapters documentation](../cms-adapters) if you are using a CMS plugin) provided
they are supported in the [JSON schema of the generatic configuration UI](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40o3r/configuration/schemas/configuration.metadata.schema.json).
Please refer to the schema for the latest supported model.

For instance, if you want to add a title to your component's configuration as a way to have a user-friendly naming and a label for your property, you can set the following JSTags:
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

If you use any non-supported tags in your tsdocs, they will be ignored by the extractor. For instance, in the following example, the `unsupportedTag` will not be part of the extracted metadata.

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

For the first case, the global categories can be defined in the workspace configuration file (such as `angular.json`) of your project by adding the `globalConfigCategories` property to the options of `@o3r/components:extractor`, for example:

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

  @O3rConfig()
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

> [!NOTE]
> The decorator `@O3rConfig()` is used to identify the component's configuration in the Chrome extension of Otter devtools.
> Further information [below](#runtime-debugging).

### Signal

```typescript
export class MyComponent implements DynamicConfigurableWithSignal<MyConfig> {
  private readonly configurationService = inject(ConfigurationBaseService, { optional: true });

  /** @inheritDoc */
  public config = input<Partial<MyConfig>>();

  @O3rConfig()
  /** @inheritDoc */
  public readonly configSignal = configSignal(this.config, MY_CONFIG_ID, MY_DEFAULT_CONFIG, this.configurationService);
}
```

### Application

To use the configuration mechanism, the first step is to inject the configuration module into our application module.

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

#### Get and inject dynamic configuration

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

  // Example of a function that gets the dynamic configuration (the JSON configuration from a server)
  public async getDynamicConfig() {
    const result = await fetch(this.dynamicContentService.getContentPath('global.config.post.json'));
    if (result && result.ok) {
      const json = (await result.json()) as CustomConfig<Configuration>[];

      if (json && json.length && this.configurationService) {
        // Again, we use the configuration service to do all the work of handling the custom configuration.
        this.configurationService.computeConfiguration(json);
      }
    } else {
      console.warn('Failed to load Dynamic Config');
    }
  }
}

````

#### Get and inject static configuration

````typescript
import {ConfigurationBaseService} from '@o3r/configuration';

export class AppComponent implements OnInit, OnDestroy {

  constructor(
    @Optional() private configurationService?: ConfigurationBaseService
  ) {
    this.getStaticConfig();
  }

  // Example of a function which gets the static configuration from the HTML body tag
  // Again, the configuration service is doing all the work for us
  private getStaticConfig() {
    if (this.configurationService) {
      this.configurationService.getConfigFromBodyTag('staticconfig');
    }
  }
}
````

#### Handle global configuration

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

  // As mentioned above, we have to merge the common configurations coming from the libraries and use the result as a global configuration
  // The configuration service has a method that does this
  private registerDefaultGlobalConfig() {
    // Compute the global configuration based on all common configurations from the libraries
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

The configuration mechanism is based on the __Configuration Service__ and __Extractors__.

The __Default configuration__ for a component is the one taken from the `.config.ts` file associated to that component.

- The configuration metadata is extracted and computed from the `.config.ts` file of each component.

The __Static configuration__ is the one injected in the `index.html` of the application.

- The configuration is modified inside a CMS or by hand by implementation teams for example.
- It will be injected as a data attribute on the body tag (`data-staticconfig`). At bootstrap, the value from the data attribute will be read and passed to the service.
- It will override the default configuration.

The __Common configuration__ cannot be overridden at component level.

- It extends the computed configuration (default + static) - no override as there should not be properties with the
  same name in the component and common configurations.

__Dynamic configuration__ is supported thanks to the configuration service.

- The configuration is loaded (using a backend call) at runtime and handled by the service.

__Input configuration__

- Component instance configuration. Ex: To be able to override a configuration field from a subcomponent, the field
  should be bubbled up to the block container. (Only the meaningful configuration fields should be bubbled up).

__Configuration priorities__ for a component:

As illustrated in the [configuration schema](#component-configuration-types):

- The highest priority is the one passed as input from a parent component.
- The second priority is the customized configuration (static or dynamic).
- The third priority is the global (or common) configuration.
- The lowest priority is the default configuration of the component (in its `config.ts` file).

## Runtime debugging

### Enable Chrome extension debugging

The Otter framework provides a [Chrome Extension](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) to help debug the application.
To enable the communication between the application and the extension, the two following steps are required:

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

2. The debug message service needs to be activated:

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

> [!NOTE]
> Get more details on the [Otter Devtools session](../dev-tools/chrome-devtools.md).

### Debugging of the Configuration Service

The dynamic configuration is handled through an NgRX store (named `configuration`) and can be debugged via the Chrome extension Redux DevTools.

# Package link

Find the `@o3r/configuration` package [here](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/configuration/README.md).
