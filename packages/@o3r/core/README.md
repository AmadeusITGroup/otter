<h1 align="center">Otter core</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/.attachments/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

This module gathers the core of the [Otter Framework](https://github.com/AmadeusITGroup/otter).
It is the foundation for all the packages (interfaces, core helpers) and contains schematics to generate your components/services etc.

Otter is a Framework providing a set of tools to accelerate the development of a prod ready application via several in-app features and developer tooling.
This includes a toolbox to customize, administrate and debug an application at runtime.

## Get Started

The application will contain the minimum setup to follow the otter recommendations and to activate the features requested
during the installation of the `@o3r/core`.

### Required environment

* **Git** : [https://gitforwindows.org/](https://gitforwindows.org/)
* **NodeJs 16.x** : [NodeJS LTS](https://nodejs.org/)
* **Yarn** : [https://yarnpkg.com/lang/en/](https://yarnpkg.com/)

**Yarn** can be installed directly using NPM:

```bash
# Installing yarn
npm install --global yarn
```

### Creating a new Otter application

```bash
# Create new application
npm create @o3r my-project
# Or
yarn create @o3r my-project
```

### Adding Material design theming

```bash
# Add Material Design
yarn ng add @angular/material
# ? Choose a prebuilt theme name, or "custom" for a custom theme: Indigo/Pink
# ? Set up HammerJS for gesture recognition? Yes
# ? Set up browser animations for Angular Material? Yes
```

Then uncomment the following lines in the `src/styles.scss` file to apply the Otter theming to Material Design components :

```scss
@include mat.core();
@include mat.all-component-typographies($typography);
@include mat.all-component-themes($mat-theme);
```

## Generators

Otter framework provides a set of code generators based on [angular schematics](https://angular.io/guide/schematics).

| Schematics                 | Description                                                                   | How to use                        |
| -------------------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| add                        | Include Otter in a library / application.                                     | `ng add @o3r/core`                |
| page                       | Create a new Page in your application.                                        | `ng g page`                       |
| service                    | Create a new Otter Service in your library / application.                     | `ng g service`                    |
| component                  | Create a new Otter component in your library / application.                   | `ng g component`                  |
| component-container        | Create a new Otter container component in your library / application.         | `ng g component-container`        |
| component-presenter        | Create a new Otter presenter component in your library / application.         | `ng g component-presenter`        |
| playwright-scenario        | Create a new Playwright scenario in your application.                         | `ng g playwright-scenario`        |
| store                      | Create a new store in your library / application.                             | `ng g store`                      |
| store-entity-async         | Create an entity async new store in your library / application.               | `ng g store-entity-async`         |
| store-entity-sync          | Create an entity sync new store in your library / application.                | `ng g store-entity-sync`          |
| store-simple-async         | Create a simple async new store in your library / application.                | `ng g store-simple-async`         |
| store-simple-sync          | Create a simple sync new store in your library / application.                 | `ng g store-simple-sync`          |
| store-action               | Create an action into an existing store.                                      | `ng g store-action`               |
| renovate-bot               | Create a basic Renovate Bot                                                   | `ng g renovate-bot`               |
| library                    | Add a new Otter Module to the current project                                 | `ng g library`                    |
| ng-add-create              | Include `ng add` schematic into your project                                  | `ng g ng-add-create`              |
| show-modules               | Display the list of available Otter modules on Otter Registry                 | `ng g show-modules`               |
| add-modules                | Add a new Otter Module to the current project                                 | `ng g add-modules`                |
| convert-component          | Convert an Angular component into an Otter component                          | `ng g convert-component`          |
| context-to-component       | Add Otter Context to an existing component                                    | `ng g context-to-component`       |

## Create your own Otter compatible module

You can refer to the [module documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md) to create an Otter compatible module.

## Presets

To accelerate the setup of repositories, different `presets` are provided that will chain the add of different modules.
Today the following presets are available.

### Preset Basic

This preset is the default one, it does not add any additional modules.

## Preset CMS

Will add all the modules allowing the allowing the full managing of an application by the CMS.
It includes the following modules:

* @o3r/localization
* @o3r/styling
* @o3r/components
* @o3r/configuration
* @o3r/dynamic-content
* @o3r/rules-engine
