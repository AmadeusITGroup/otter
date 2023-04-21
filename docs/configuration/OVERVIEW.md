# Configuration mechanism

The aim of this document is to help developers to implement configuration inside components, in order to be compliant
with __cms architecture__. This will give the possibility to __Business Analyst__ to configure the
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

- Each __component type__ will have a default configuration which will be defined in _.config.ts_ file associated to the
  component

> __WARNING__ the field name 'id' should not be used in the configuration, as we created an unique one for the entity configuration store

### Configuration coming from config store

- Each __component type__ can have a customized config (compliant with the store model). This custom config can be
  asynchronously loaded from a backend server or it can be injected in the body tag of the app. In both cases, this
  content will be used to update the store.
- If present, it will override the default config. (Don't worry for the implementation now, we'll see it later)

### Global config

- The common configuration is the one used in multiple components (it can be a date format, price display, type of input
  form fields from an angular material input element ...)
- A common configuration is defined in every library. The application common configuration (__global config__) will be
  the result of the __merge of all common__ configurations.
- The common configuration is __not overridden__ at component type (there will be no properties with the same name in
  common config and components).
- At runtime after the configuration of a component is computed it is extended by global config, so components can use
  fields from global

### Input config

- The configuration of a __component instance__ can be overridden via @Input config

__The priorities for the config__:

- the highest priority is the one passed as input from a parent component
- the second priority is the priority by component type set in the store
- the lowest priority is the default config set on component (in the config.ts file of the component)

## Cases we handle

### Static configuration (override)

- The default configuration is extracted by __cms-adapters__ tool and bundled in a JSON file

- From this file we extract and modify the components configurations we want to customize and we create a new JSON file.

- The content of the new file is injected in the index.html body's data attribute (_data-staticconfig_)

- The value from the data attribute is taken and used to update the configuration store

The big gain here is that the custom config is set up at the bootstrap of the application and available for the
components at their instantiation time

### Dynamic configuration

- The default configuration is extracted by __cms-adapters__ tool and bundled in a JSON file will be exposed in the CMS

- In the CMS plugin the Business Analyst will modify configuration of components and this ones will be exposed (in the
  server) as dynamic content of the app

- The application will do an http call, get the custom config and inject it in the store.

__No need of rebuild/redeploy the app__

## Config types lib/app

- At __library__ level we have the config for components (__blocks, components, elements__).

A block component class should implement __Block__ interface from __@o3r/core__ to be identified by cms adapter

- At application level:

__Page config__ - each page component class should implement __Page__ interface available in __@o3r/core__ in order to
be identified by cms adapter

__Application config__
The application can have 2 types of configs depending of the use cases: __pre-bootstrap__ and __runtime (
post-bootstrap)__ config

Pre-bootstrap config

- Defined in one interface which will extend __AppBuildConfiguration__ interface available in __@o3r/core__ in order
  to be identified by cms adapter
- PreBootstrap config object is used for configurations needed before loading the angular app component, and it will be
  injected by the cms in the index.thml body tag data-bootstrapconfig as a data attribute

Runtime config

- Defined in one interface which will extend __AppRuntimeConfiguration__  interface available in __@o3r/core__ in order to
  be identified by cms adapter
- The object defined here is used as configuration for the application ( ex: angular material form field appearance
  global on the app)

## Examples

### Default config

Possible example of default config file for a component.  
You can have a look at [configuration types supported by cms extractor](./CONFIGURATION_SUPPORTED_EXTRACTOR.md) for more
details about the types.

```typescript
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
}

export const MY_DEFAULT_CONFIG: MyConfig = {
  myStringField: 'myStringField default value',
  myBooleanField: false,
  myNumberField: 0,
  myStringListField: ['firstDefaultValue', 'secondDefaultValue']
};
```

### Component file (*.component.ts)

Here is an example of configuration in the component, note that dynamicConfig$ is there for the configuration service
and config$ for the configuration store  
This part is already handled by our [component generator](../core/OTTER_ANGULAR_TOOLS.md) if you are use it to generate your
components

```typescript
    // ...
export class MyComponent implements DynamicConfigurable<MyConfig> {
  @Input() // Component instance config
  public config?: Partial<MyConfig>;

  /** Dynamic configuration based on the input override configuration and the configuration service if used by the application */
  private dynamicConfig$: ConfigurationObserver<MyConfig>;

  /** Configuration stream based on the input and the stored configuration.
   * Note: Values emitted from this stream will be used inside the component
   */
  public config$: Observable<MyConfig>;

  //...

  constructor(
    // The configuration service is used here to do the merge between the default config with the config from store
    @Optional() configurationService?: ConfigurationBaseService
  ) {
    // Register the component config (default) in the store. ConfigurationObserver is used to get the config stream. 
    // The configService will do the merge between the default config (MY_DEFAULT_CONFIG) and possible config which is already in the store for this component identified by (MY_CONFIG_ID)
    this.dynamicConfig$ = new ConfigurationObserver<MyConfig>(MY_CONFIG_ID, MY_DEFAULT_CONFIG, configurationService);
    this.config$ = this.dynamicConfig$.asObservable();
  }

  public ngOnChanges(change: SimpleChanges) {
    // Each time the 'config' input will change we'll make the dynamic config observable to emit, leading to config$ to emit
    if (change.config) {
      this.dynamicConfig$.next(this.config);
    }
  }
}
```

### Application

To use the config mechanism first thing is to inject the config module in our app module

````typescript
import {ConfigurationBaseServiceModule} from '@o3r/configuration';

@NgModule({
  imports: [
    ...
      ConfigurationBaseServiceModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [...]
})
export class AppModule {
}
````

#### Get and inject dynamic config

````typescript
export class AppComponent implements OnInit, OnDestroy {
...

  constructor(private dynamicContentService: DynamicContentService,
              @Optional() private configurationService?: ConfigurationBaseService) {
  ...
  }

  public ngOnInit() {
  ...
    if (this.configurationService) {
      this.getDynamicConfig();
    }
  }

...

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

...

export class AppComponent implements OnInit, OnDestroy {

  constructor(...
              @Optional() private configurationService?: ConfigurationBaseService) {
    this.getStaticConfig();
  }

  // Example of a function which get's the static config fromt he html body tag
  // Again the config service is doing all the job for us
  private getStaticConfig() {
    if (this.configurationService) {
      this.configurationService.getConfigFromBodyTag('staticconfig');
    }
  }

...
}
````

#### Handle global config

````typescript
import {AREA_1_CONFIG_DEFAULT} from '@scope/area-1';
import {AREA_2_CONFIG_DEFAULT} from '@scope/area-2';
import {ConfigurationBaseService} from '@o3r/configuration';

...

export class AppComponent implements OnInit, OnDestroy {

  constructor(...
              @Optional() private configurationService?: ConfigurationBaseService) {
    this.registerDefaultGlobalConfig();
  }

  // As mentioned above, we have to merge common configs coming from libraries and to pass the result as global config to the store
  // The config service has a method which is doing this 
  private registerDefaultGlobalConfig() {
    // Compute the global config based on all common configuration from libraries
    const global = {...AREA_1_CONFIG_DEFAULT, ...AREA_2_CONFIG_DEFAULT};
    this.configurationService.extendConfiguration(global);
  }

...
}

````

## Key takeaways

The configuration mechanism is based on __Store Configuration__ and __Cms Adapters__.

__Default configuration__ for a component type is the one taken from the .config.ts file associated to that component.

- The config metadata is extracted and computed from the .config.ts file of each component

__Static configuration__ is the one injected in the index.html of the application.

- It's the configuration which is modified inside the cms or by hand (implementation teams)
  - It will be injected as a data attribute on the body tag (data-staticconfig). At bootstrap, the value from the data
    attribute will be read and the store updated.
- It will override the default configuration

__Common configuration__ is supported, but it cannot be overridden at component type level

- Extends the computed configuration (default + static) - no override as there we should not have properties with the
  same name in the component configs and common

__Dynamic configuration__ is supported thanks to the store

- The configuration is loaded (backend call) at runtime and the store is updated

__Input config__

- Component instance configuration. Ex: To be able to override a configuration field from a subcomponent, the field
  should be bubbled up to the block container. ( Only the meaningful configuration fields should be bubbled up ).

__Config priorities__ for a component:

- the highest priority is the one passed as input from a parent component  
- the second priority is the priority by component type set in the store  
- the lowest priority is the default config set on component (in the config.ts file of the component)

## Runtime debugging

### Enable Chrome extension debugging

The Otter framework provides a [Chrome Extension](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) to help debug the application.
To enable the communication with the [Otter Devtools](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) the two following steps are required:

1. Importing the Devtools module into the application AppModule:

```typescript
import { ConfigurationDevtoolsModule } from '@o3r/configuration';

@NgModule({
  imports: [
    ...,
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
