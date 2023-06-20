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

### Required environment

* **Git** : [https://gitforwindows.org/](https://gitforwindows.org/)
* **NodeJs 14.x** : [NodeJS LTS](https://nodejs.org/)
* **Yarn** : [https://yarnpkg.com/lang/en/](https://yarnpkg.com/)

**Yarn** can be installed directly using NPM:

```bash
# Installing yarn
npm install --global yarn
```

### Creating a new Angular application

```bash
# Create new application
npx -y -p @angular/cli ng new
# ? What name would you like to use for the new workspace and initial project? <application name>
# ? Would you like to add Angular routing? Yes
# ? Which stylesheet format would you like to use? SCSS

```

> **Information**: You can also install and run the `Angular CLI` locally with the following commmands:
>
> ```bash
> yarn add @angular/cli
> yarn ng new
> ```

### Adding Otter dependency

```bash
# Setup Otter dependencies
yarn ng add @o3r/core
# ? Activate Otter localization? Yes
# ? Work on Otter with symlinks? No
```

or for NPM users

```bash
npx ng add @o3r/core
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

Otter library provides a set of code generators based on [angular schematics](https://angular.io/guide/schematics).

| Schematics                 | Description                                                                   | How to use                        |
| -------------------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| add                        | Include Otter in a library / application.                                     | `ng add @o3r/core`                |
| page                       | Create a new Page in your application.                                        | `ng g page`                       |
| service                    | Create a new Otter Service in your library / application.                     | `ng g service`                    |
| fixture                    | Adding functions to an Otter fixture based on a selector and default methods. | `ng g fixture`                    |
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
| storybook-component        | Create an Storybook file for a presenter.                                     | `ng g storybook-component`        |
| renovate-bot               | Create a basic Renovate Bot                                                   | `ng g renovate-bot`               |
| module                     | Create a new Otter compatible module in your monorepo                         | `ng g module`                     |
| ng-add-create              | Include `ng add` schematic into your project                                  | `ng g ng-add-create`              |
| show-modules               | Display the list of available Otter modules on Otter Registry                 | `ng g show-modules`               |
| add-modules                | Add a new Otter Module to the current project                                 | `ng g add-modules`                |
| configuration-to-component | Add configuration to an Otter component                                       | `ng g configuration-to-component` |
| convert-component          | Convert an Angular component into an Otter component                          | `ng g convert-component`          |

## Create your own Otter compatible module

You can refer to the [module documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md) to create an Otter compatible module.
