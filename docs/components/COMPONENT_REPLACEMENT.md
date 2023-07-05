# Component replacement

## Overview

This replacement mechanism integrated with application customization relies on [Angular component factories](https://angular.io/guide/dynamic-component-loader)
in order to create the right component at runtime.  
You can see a lot of details in the link above, and you'll probably notice that it is very verbose and cumbersome to
implement:

* Inputs and outputs have to be bound again, outside of the template
* Change detection has to be adapted in order to pass potential changes of those inputs when the parent component changes

In order to alleviate that, we provide a directive ``c11n`` that, when applied to an ``ng-template`` and given the following information will handle all the wiring behind the scene:

* The type of the component to instantiate
* The inputs and outputs to bind
* The potential configuration override to apply

Now let's see how to use that mechanism in practice.

## Prepare your base app to register custom components

Firstly we need to prepare the base app to have the extensibility of providers. To do this you need to create a new variable in your app.module.ts that can extend the providers, lets call it customProviders.

#### src/app/app.module.ts

```typescript
import {initializeEntryComponents, registerCustomComponents} from '../customization/presenters-map.empty';
import {C11nModule} from '@o3r/components';
...

const entry = initializeEntryComponents();

@NgModule({
  imports: [
    ...
    C11nModule.forRoot({registerCompFunc: registerCustomComponents}),
    ...entry.customComponentsModules
  ],
  ... 
})
```

We also need to create 2 functions _initializeEntryComponents_ and _registerCustomComponents_  that will initialize the values for the base application so the app compiles.
We'll do that in a customization folder src/customization.
This is just an "empty shell" since it is just adding an empty array to the customComponents and an empty array to the custom modules. It will register an empty map of custom components.  
However, it allows the customization app to replace this empty functions with functions which provides the setup for custom components.

#### src/customization/presenters-map.empty.ts

```typescript
import {EntryCustomComponents} from '@o3r/components';

export function registerCustomComponents(): Map<string, any> {
  return new Map();
}

export function initializeEntryComponents(): EntryCustomComponents  {
  return {
    customComponents: [],
    customComponentsModules: []
  };
}

```

## Prepare your customization app to use custom providers

Once the base app is prepared, the customization app can be configured to use the customization. Firstly a file which will provide custom components configs to the application needs to be created:

* Could be named: ``custo-app-folder/white-label/src/customization/component-replacement-map.ts``.

* In your ``custom-config.js``, register your mapping ``"customComponentsFile": "component-replacement-map.ts"`` so the framework will use this file instead of ``presenters-map.empty.ts`` which is here by default so that the application compiles.

* Within the replacement file you will register the custom components like this:

#### custo-app-folder/white-label/src/customization/component-replacement-map.ts

````typescript
import {EntryCustomComponents, registerCustomComponent} from '@o3r/components';
import {ExamplePresComponent} from './example/example-pres.component';
import {ExamplePresModule} from './example/index';

/**
 * @example
 * {
 * const firstCompMap = registerCustomComponent(new Map(), 'firstCompKey', FirstComponent);
 * const secondCompMap = registerCustomComponent(firstCompMap, 'secondCompKey', SecondComponent);
 * return secondCompMap;
 * }
 */
export function registerCustomComponents(): Map<string, any> {
  return registerCustomComponent(new Map(), 'exampleCustomPres', ExamplePresComponent);
}
/** Returns the array of custom components and the array of associated components modules */
export function initializeEntryComponents(): EntryCustomComponents {
  return {
    customComponents: [ExamplePresComponent],
    customComponentsModules: [ExamplePresModule]
  };
}
````

* Once you run the ``apply customization`` script, the ``angular.json`` of the application will be modified to replace the ``presenters-map.empty.ts`` with your own file, meaning that your application module will now import your custom components.

## Configure parent component to accept new subcomponent

Last part to do is to tell to the parent component to replace a default subcomponent with the custom one.  
To do that we have to simply provide a configuration to the parent component.
Here is an example:

#### custo-app-folder/customization/configuration.js

```javascript
var body = window.document.getElementsByTagName('body')[0]


body.setAttribute('data-bootstrapconfig', JSON.stringify({
  // Configuration override going here
}));

body.setAttribute('data-staticconfig', JSON.stringify([
  {
    name: 'o3r-example-cont',
    config: {exampleCustomPresKey: 'exampleCustomPres'},
    library: '@scope/o3r-components'
  }
]));
```

This configuration key's value is used at runtime to lookup in the component replacement map which decides the component class to create.

## How components are made to accept replacement

In this section we will detail how to make a container's presenter replaceable by this mechanism with a simple, almost empty component.

### Component's module

Here we need to do two things:

* Import the module related to customization: ``C11nModule``

````typescript
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {C11nModule} from '@o3r/components';
import {DummyContComponent} from './dummy-cont.component';
import {DummyPresComponent} from '../presenter/dummy-pres.component';

@NgModule({
  imports: [CommonModule, C11nModule],
  declarations: [DummyContComponent],
  exports: [DummyContComponent],
})
export class ExampleContModule {}
````

### Component's configuration

Since the objective is to replace a component with another, we need a place to hold the information of the **key** of the component we want to use.  
That key will correspond to what is added by the application via ``registerCustomComponent``.  

That information is expected to be a property of the **component's configuration** as it can be exposed by the CMS and edited by a customer.  
Since configurations **have** to have a default value, in this specific instance it must always be the **empty string**. The default presenter will be declared in the component's class.

````typescript
import { computeConfigurationName, Configuration } from '@o3r/configuration';

export interface DummyContConfig extends Configuration {
  /** Key used to identify a custom component, if provided */
  customDummyKey: string;
}

export const DUMMY_CONT_DEFAULT_CONFIG: DummyContConfig = {
  customDummyKey: ''
}

export const DUMMY_CONT_CONFIG_ID = computeConfigurationName('DummyContConfig', '@scope/o3r-components');
````

### Component's class

Here we need to do a couple of things:

* Retrieve the component's configuration as described in the [configuration overview](../configuration/OVERVIEW.md)
* Inject the ``C11nService``
* Compute a ``presenter$`` observable by applying the ``c11nService.getPresenter()`` operator to our ``config$`` observable, specifying the default presenter to use
* Prepare an ``outputs`` object

```` typescript
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Optional} from '@angular/core';
import {DummyContConfig, DUMMY_CONT_CONFIG_ID, DUMMY_CONT_DEFAULT_CONFIG} from './dummy-cont.config';
import {DummyContContext} from './dummy-cont.context';
import {DummyPresContextInput, DummyPresContextOutput, DummyPresConfig} from '../presenter/index';
import {DummyPresComponent} from '../presenter/dummy-pres.component';
import {ConfigurationBaseService, ConfigurationObserver} from '@o3r/configuration';
import {Block} from '@o3r/core';
import {C11nService} from '@o3r/components';
import {Observable} from 'rxjs';

@Component({
  selector: 'o3r-dummy-cont',
  templateUrl: './dummy-cont.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DummyContComponent implements DynamicConfigurable<DummyContConfig>, DummyContContext, OnInit, OnDestroy, Block {

  /** Input configuration to override the default configuration of the component
   */
  @Input()
  public config: Partial<DummyContConfig> | undefined;

  /** Dynamic configuration based on the input override configuration and the configuration service if used by the application */
  private dynamicConfig$: ConfigurationObserver<DummyContConfig>;

  /** Configuration stream based on the input and the stored configuration */
  public config$: Observable<DummyContConfig>;

  /** Observable of the presenter that we want to use, processed by the c11n directive */
  public presenter$: Observable<Context<DummyPresContextInput, DummyPresContextOutput> & DynamicConfigurable<DummyPresConfig>>;
  
  /** Convenience object to prepare all the outputs binding in advance */
  public outputs: Functionify<DummyPresContextOutput>;

  constructor(private c11nService: C11nService,
              @Optional() private configurationService?: ConfigurationBaseService) {
    // Retrieve the component's configuration
    this.dynamicConfig$ = new ConfigurationObserver<DummyContConfig>(DUMMY_CONT_CONFIG_ID, DUMMY_CONT_DEFAULT_CONFIG, this.configurationService);
    this.config$ = this.dynamicConfig$.asObservable();

    // Load the right presenter
    this.loadPresenter();
  }

  private loadPresenter() {
    this.presenter$ = this.config$.pipe(
      // Compute which presenter to use according to the configuration and the default presenter that we define here
      this.c11nService.getPresenter(DummyPresComponent, 'customDummyPresKey')
    );

    this.outputs = {
      onDummyOutput: this.dummyOutput.bind(this)
    };
  }

  public dummyOutput() {
    console.log('output');
  }
}
````

### Component's template

Since the presenter used by the container will be decided at **runtime**, we won't use any selector in our container's template.  
Instead, we will simply use an ``ng-template`` tag to which we apply the Otter ``c11n`` directive, passing it the various things computed in the component's class:

* The ``presenter$`` observable, that will tell which presenter component to use
* The ``inputs``, a map that wraps all the inputs that the container passes to the presenter
* The ``config`` override, if the container wants to override part of the presenter's configuration
* The ``outputs``, a map that wraps all the handlers that the container wants to bind to the presenter

````html
<ng-template c11n
    [component]="presenter$ | async"
    [inputs]="{dummyInput: 'dummy'}"
    [config]="{}"
    [outputs]="outputs"
></ng-template>
````

## Known limitations

The main limitation is that it is not possible to apply any modification to the ``host`` component created by a factory.

What it means is that any of those:

````html
<!-- Host binding -->
<o3r-dummy-cont [class]="dynamicClass"></o3r-dummy-cont>

<!-- Applying directives to the component -->
<o3r-dummy-cont [formControl]="dummyFormControl"></o3r-dummy-cont>
````

Are not possible through an ``ng-template`` and ``c11n`` combination.

Though there is a solution for the first example in making the value an input, and bind it inside the component using
the [HostBinding](https://angular.io/api/core/HostBinding) decorator, there is no actual solution for applying directive.  
A [feature request](https://github.com/angular/angular/issues/8785) has been opened for a long time and finally made it
to the "Future" section and Angular's roadmap.
