# Otter configuration

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).

This module contains configuration related features (CMS compatibility, Configuration override, store and debugging)
It comes with an integrated ng builder to help you generate configurations supporting the Otter CMS integration.

## How to install

```shell
ng add @o3r/configuration
```

> **Warning**: this module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Description

The aim of this document is to help developers to implement configuration inside components, in order to be compliant
with the **cms architecture**. This will give the possibility to **Business Analysts** to configure the
application/components.

### Component config types

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

#### Default configuration

- Each **component type** will have a default configuration which will be defined in the _.config.ts_ file associated to the
  component

> **WARNING** the field name 'id' should not be used in the configuration, as we created a unique one for the entity configuration store

#### Configuration coming from config store

- Each **component type** can have a customized config (compliant with the store model). This custom config can be
  asynchronously loaded from a backend server or it can be injected in the body tag of the app. In both cases, this
  content will be used to update the store.
- If present, it will override the default config. (Don't worry for the implementation now, we'll see it later)

#### Global config

- The common configuration is the one used in multiple components (it can be a date format, price display, type of input
  form fields from an angular material input element ...)
- A common configuration is defined in every library. The application common configuration (**global config**) will be
  the result of the **merge of all common** configurations.
- The common configuration is **not overridden** at component type (there will be no properties with the same name in
  common config and components).
- At runtime the components can access fields from global configuration thanks to the configuration service

#### Input config

- The configuration of a **component instance** can be overridden via @Input config

**The priorities for the config**:

- the highest priority is the one passed as input from a parent component
- the second priority is the one by component type set in the store
- the lowest priority is the default config set on the component (in the config.ts file of the component)

## More details

Find more information in the [documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/configuraiton/OVERVIEW.md).
