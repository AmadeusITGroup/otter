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

##### Usage

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

#### Builders: @o3r/core:run-script

A simple angular builder used to launch _package.json_ scripts via _ng cli_.  
The builder is useful in a monorepo context, where we have a library which is not built with an angular builder. (Ex: It is the case for an sdk generated with _@ama-sdk/schematics_ generator). 
##### Usage
  
Configration example:   
In your project section from the _angular.json_ file.

```json
...
"my-lib": {
  "projectType": "library",
  "root": "modules/@scope/components",
  "sourceRoot": "modules/@scope/components/src",
  "prefix": "scope",
  "architect": {
    "build": {
      "builder": "@o3r/core:run-script",
      "options": {
        "script": "build",
      }
    },
    "custom-name": {
      "builder": "@o3r/core:run-script",
      "options": {
        "script": "my-custom-script",
      }
    }
  }
}
```

You should have the corresponding scripts in package.json file.

```json
{  ...
  "scripts": {
    "build": "tsc -b tsconfigs/esm2020", // example
    "my-custom-script": "prepare-publish ./dist" // example
    ...
  }
  ...
}
```
Now with this configuration in place you can run the scripts via the angular cli.
```
npx ng lint my-lib
or
yarn run ng lint my-lib
```
```
npx ng run my-lib:custom-name
or
yarn run ng run my-lib:custom-name
```

## Middleware

### Boostrap config

A helper that injects a bootstrap config with allowParamOverride set to true inside the body dataset, to have all debug/override capabilities with a local development server.

### Parameter extractor

A helper that extracts query and post params from request and adds them as data attributes in the BODY. Used for local development server.
