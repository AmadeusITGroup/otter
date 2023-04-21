# Component structure

This document describes the structure and the content of component files.

```
<component-name>
├── container
│   ├── README.md
│   ├── <component-name>-cont.component.ts
│   ├── <component-name>-cont.config.ts
│   ├── <component-name>-cont.context.ts
│   ├── <component-name>-cont.fixture.ts
│   ├── <component-name>-cont.module.ts
│   ├── <component-name>-cont.spec.ts
│   ├── <component-name>-cont.template.html
│   └── index.ts
├── contracts
│   ├── <model-name>.model.ts
├── directives
│   ├── <directive-name>.directive.ts
├── presenter
│   ├── <component-name>-pres.component.ts
│   ├── <component-name>-pres.config.ts
│   ├── <component-name>-pres.context.ts
|   ├── <component-name>-pres.localization.json
|   ├── <component-name>-pres.translation.ts
│   ├── <component-name>-pres.fixture.ts
│   ├── <component-name>-pres.module.ts
│   ├── <component-name>-pres.spec.ts
│   ├── <component-name>-pres.style.scss
│   ├── <component-name>-pres.style.theme.scss
│   ├── <component-name>-pres.template.html
│   └── index.ts
├── sub-components
│   └── <component-name>
├── <component-name>.int-spec.ts
└── index.ts
```

This is a general tree for a component that respects the container/presenter pattern.
There are three folders:

* `container` component folder; It contains the files related to the container component. Check the [container / presenter documentation](./CONTAINER_PRESENTER.md) for more details
* `presenter` component folder; It contains the files related to the presenter component. Check the [container / presenter documentation](./CONTAINER_PRESENTER.md) for more details
* `sub-components` folder; A component may be composed of sub-components. They should be located in a dedicated sub-components folder inside the component folder. We want to keep all components which belongs to the same functional area and are not blocks in the same functional folder.
Nevertheless, if a component is shared among different functional blocks, it will have to be set inside the dedicated shared folder (at the root of components folder).

Optionally, there could be other two folders:

* `contracts`; used to contain all shared models or interfaces over your components (between container and presenter, sub-components or other components).
* `directives`, which contains directives used in the context of your component. Keeping them in a dedicated folder will help you extract them if they have to be extracted in order to be shared.

If you don't need container/presenter structure because your component is only a presentational component, then the structure will be:

```
<component-name>
├── contracts
│   ├── <model-name>.model.ts
├── directives
│   ├── <directive-name>.directive.ts
├── <component-name>-pres.component.ts
├── <component-name>-pres.config.ts
├── <component-name>-pres.context.ts
├── <component-name>-pres.localization.json
├── <component-name>-pres.translation.ts
├── <component-name>-pres.fixture.ts
├── <component-name>-pres.module.ts
├── <component-name>-pres.spec.ts
├── <component-name>-pres.style.scss
├── <component-name>-pres.style.theme.scss
├── <component-name>-pres.template.html
└── index.ts
```

## Content / files description

### Configuration (`.config.ts`)

Check the [configuration docs](../configuration/OVERVIEW.md)

### Context (`.context.ts`)

It is used to define the contract to interact with your component, defining the set of dynamic inputs and outputs that a component has.
It is structured into three interfaces:

* `*ContextInput` interface (e.g. `MyComponentContextInput`): it contains all the inputs of a component. Fields must have a documentation.
* `*ContextOutput` interface (e.g. `MyComponentContextOutput`): it contains all the outputs of a component. Fields must have a documentation.
* interface `MyComponentContext`: it brings together `ContextInput` and `ContextOutput`, extending `Context<MyComponentContextInput, MyComponentContextOutput>` from `@o3r/core`.

```typescript
import {Context} from '@o3r/core';

export interface MyComponentContextInput {

  input1: number;

  input2: TemplateRef<MyComponentPresContext>;
}
  
export interface MyComponentContextOutput {

  output1: number;

  output2: string;

}

export interface MyComponentContext extends Context<MyComponentContextInput, MyComponentContextOutput> {}
```

More info can be found in the [Component replacement documentation](./COMPONENT_REPLACEMENT.md)

### Translation (`*.translation.ts`)

It is used to define the localization variables used by component template. my-component.translation.ts file typically defines an interface which extends `Translation` from `@o3r/core` with all possible variable names used by your presenter template. It also exports a constant which satisfies the above contract. The values for each property are localization keys (real keys from localization bundle).

```typescript
import {Translation} from  '@o3r/core';

export  interface MyComponentPresTranslation extends Translation {
  prop1: string;
  prop2: string;
}

export  const translations: MyComponentPresTranslation = {
  prop1: 'o3r-my-component-pres.somekey1',
  prop2: 'o3r-my-component-pres.somekey2'
}; 
```

### Localization (`*.localization.json`)

It defines an object beeing key/value pairs. Each value is a json object having `description` and `defaultValue` properties. Eventually you can reference a global key via $ref using relative path to `global-localization.json` which sits in `src` or in different package in dependencies. The purpose of this file is to provide a default localization for component so that library user can start building pages using components without worrying about localization. `*.localization.json` specifies only default values in english.

```typescript
{
  'o3r-my-component-pres.somekey1': {
    'description': 'This is somekey1 description for translators',
    'defaultValue': 'This is my default value 1'
  },
  'o3r-my-component-pres.somekey2': {
    'description': 'This is somekey2 description for translators',
    'defaultValue': 'This is my default value 2'
  },
  'o3r-my-component-pres.someglobalkey1': {
    '$ref': '../global.localization.json#/someglobalkey1'
  },
  'o3r-my-component-pres.someglobalkey2': {
    '$ref': '@scope/common/global.localization.json#/someglobalkey2'
  }
}
```

### Fixtures (`*.fixtures.ts`)

It defines the component object model used for testing. In other words, it is a class which contains mainly a set of accessors to the DOM elements of the component.
There is a dedicated [fixtures documentation](./FIXTURES.md) to explain in details how to write and use them.

### Unit test (`*.spec.ts`)

Unit test for the component using angular TestBed suite.

### Integration test (`*.int-spec.ts`)

Test interactions between components, also using fixtures.

### Style (`*.style.scss`)

It's the style relative to the component. It is using the scss variables defined in `.style.theme.scss`.
By default, `None` view encapsulation is used.

### Style theme

It's the file to define the scss variables used inside the component.
In our library, variables, fonts, mixins and all the basic styles are in the package '@o3r/styling'.
If you want to use them, for example `@use "@o3r/styling" as o3r;`.

### Template (`*.template.html`)

Template of the component.

### Component class (`*.component.ts`)

This is the core of a component. Here is where you have the angular decorators for the component itself.
By default, it implements Configurable with generic of the class defined in my `.config.ts`, as explained in [Configuration](#configuration) .
It also implements the context, defined in `.context.ts`, as explained in [Context](#context).
We are compliant with angular best practice, and we enforce rules using ts-linter.

### Module (`*.module.ts`)

It defines the `NgModule` for the component.

### Index (`index.ts`)

It is used as a barrel to ease the import's paths.
We used to export:

* module
* context
* configuration

## Runtime debugging

### Enable Chrome extension debugging

The Otter framework provides an [Otter Chrome Extension](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) to help debug the application.
To enable the communication with the [Otter Devtools](../dev-tools/chrome-devtools.md) the two following steps are required:

1. Import the Devtools module into the application AppModule:

```typescript
import { ComponentsDevtoolsModule } from '@o3r/components';

@NgModule({
  imports: [
    ...,
    ComponentsDevtoolsModule
  ]
})
export class AppModule { }
```

2. Activate the debug message service:

```typescript
import { ComponentsDevtoolsMessageService } from '@o3r/components';

@Component({ ... })
export class AppComponent {
  constructor(componentsDevtoolsMessageService: ComponentsDevtoolsMessageService) {
    if (IS_DEBUG_MODE) {
      componentsDevtoolsMessageService.activate();
    }
  }
}
```

> **Note**: get more details on [dev tools session](../dev-tools/chrome-devtools.md)
