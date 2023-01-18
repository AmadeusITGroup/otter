# Otter Angular Tools

## Builders

### Localization

Generate localization based on CMS Localization metadata.

### Multi Watcher

Run multiple Angular CLI targets in watch mode in parallel.

### Prefetch

See [ngx-prefetch](https://github.com/AmadeusITGroup/ngx-prefetch).

### Dev build

#### Builders: @o3r/core:lib-build  @o3r/core:ngc

These builders are used on a package which needs to be published with __sub_entries__, particularly a library

The builders are created as a response of an issue related to ng-packager, which has a really slow build time when we use it with sub-entries.
<https://github.com/ng-packagr/ng-packagr/issues/1758>  

For __production__ build we use:

- `lib-build` + `ng-packager`

In __development__ phase we use:

- `lib-build` + `ngc` builder from _@o3r/core_ which is faster than ng-packger when we are using sub-entries.

As can be seen, __lib-build__ is used to launch the execution of needed builds for production or development.
It also contains hooks to be executed __before__ launching _ng-packager or ngc_ builds (ex: read information related to output dir,
baseUrl etc. from _tsconfig_ ), and hooks to be executed after _ng-packager/ngc_ builds, basically to ensure that the generated package.json has all the needed information (custom cms metadata related fields added).

_ngc_ builder is the one which is used in development build, based on @angular/cli and StyleSheetProcessor from ng-packager. The reason of its creation is that it is faster that _ng-packer_ when used in a package with sub-entries.

#### Usage

In angular.json file of your lib.

```json
"scope-components": {
  "projectType": "library",
  "root": "modules/@scope/components",
  "sourceRoot": "modules/@scope/components/src",
  "prefix": "scope",
  "architect": {
    "build": {
      "builder": "@o3r/core:lib-build", // wrapper builder
      "options": { // build dev
        "target": "scope-components:ngc-build",
        "tsConfig": "tsconfig.json", // this options is needed when the package is exporting cms metadata (typically components package)
        "watch": true
      },
      "configurations": {
        "production": { // build prod
          "target": "scope-components:ng-packager",
          "tsConfig": "tsconfig.prod.json" // this options is needed when the package is exporting cms metadata (typically components package)
        }
      }
    },
    "ng-packager": {
      "builder": "@angular-devkit/build-angular:ng-packagr", // ng-packager builder
      "options": {
        "tsConfig": "modules/@scope/components/tsconfig.prod.json",
        "project": "modules/@scope/components/src/ng-package.json"
      }
    },
    "ngc-build": {
      "builder": "@o3r/core:ngc", // ngc builder
      "options": {
        "tsConfig": "tsconfig.json"
      }
    },
  }
}
```

## Schematics

| Schematics          | Description                                                           | How to use                                        |
| ------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| add                 | Include Otter in a library / application.                             | `ng add @o3r/core`                          |
| page                | Create a new Page in your application.                                | `ng generate @o3r/core:page`                |
| service             | Create a new Otter Service in your library / application.             | `ng generate @o3r/core:service`             |
| fixture           | Adding functions to an Otter fixture based on a selector and default methods.           | `ng generate @o3r/core:fixture`           |
| component           | Create a new Otter component in your library / application.           | `ng generate @o3r/core:component`           |
| component-container | Create a new Otter container component in your library / application. | `ng generate @o3r/core:component-container` |
| component-presenter | Create a new Otter presenter component in your library / application. | `ng generate @o3r/core:component-presenter` |
| playwright-scenario | Create a new Playwright scenario in your application.                 | `ng generate @o3r/core:playwright-scenario` |
| store               | Create a new store in your library / application.                     | `ng generate @o3r/core:store`               |
| store-entity-async  | Create an entity async new store in your library / application.       | `ng generate @o3r/core:store-entity-async`  |
| store-entity-sync   | Create an entity sync new store in your library / application.        | `ng generate @o3r/core:store-entity-sync`   |
| store-simple-async  | Create a simple async new store in your library / application.        | `ng generate @o3r/core:store-simple-async`  |
| store-simple-sync   | Create a simple sync new store in your library / application.         | `ng generate @o3r/core:store-simple-sync`   |
| store-action        | Create an action into an existing store.                              | `ng generate @o3r/core:store-action`        |
| storybook-component | Create an Storybook file for a presenter.                             | `ng generate @o3r/core:storybook-component` |
| renovate-bot        | Create a basic Renovate Bot                                           | `ng generate @o3r/core:renovate-bot`        |

### Schematic property override

If you want to skip the linter formatting on generated files, you may want to add the value of `skipLinter` property directly in `angular.json` file of your lib/app, under schematics property for each generator entry. In this way you'll avoid prompting the `Skip linter` question when you use the generator.

```json
// angular.json file
"schematics": {
    "@o3r/core:component": {
      "path": "src/components",
      "skipLinter": true
    },
    ...
```

## Middleware

### Boostrap config

A helper that injects a bootstrap config with allowParamOverride set to true inside the body dataset, to have all debug/override capabilities with a local development server.

### Parameter extractor

A helper that extracts query and post params from request and adds them as data attributes in the BODY. Used for local development server.
