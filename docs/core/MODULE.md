# Otter Module

Otter is a framework based on [Angular](https://angular.io/) which regroups a set of modules and provides tooling to make them communicate together.

## Definition

To be considered as an Otter Module, the package need to respect the following guidelines:

- The NPM package should expose `ng-add` and `ng-update` schematics.
- The module should report logs via the Logger exposed by the [@o3r/logging](https://www.npmjs.com/package/@o3r/logging)
- If the module exposes debug (or configuration) feature, it should be done via the debug interfaces exposed by [@o3r/core](https://www.npmjs.com/package/@o3r/core)

## Helpers packages

To help developers to create their own Otter compatible module, the Otter framework provides 3 technical modules:

- [@o3r/schematics](https://www.npmjs.com/package/@o3r/schematics): exposes helper functions to develop the module schematic features
- [@o3r/extractors](https://www.npmjs.com/package/@o3r/extractors): exposes helper functions to create code metadata extractor to help in CMS communication
- [@o3r/dev-tools](https://www.npmjs.com/package/@o3r/dev-tools): provides a collection of Command Line Interfaces which can be used in CI and build workflows

## List of Otter official modules

The full list of official modules can be found in the [Documentation Home page](../README.md#available-packages-and-tools).

## How to create its own Otter module

### Module development

As indicated in the [definition section](#definition), an Otter module should expose a `ng-add` schematic to allow developers to install the module via the command `ng add <package-name>`.
> **Note**: Information relative to the `ng-add` schematics is available [here](https://angular.io/cli/add).

As all the Otter modules follow the same requirement, the new module can use provided helpers to trigger the installation of other Otter modules through the `ng-add` schematic of the requested module.

Basic example of dependency module installation:

```typescript
import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter MyModule to an Otter Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (_tree: Tree, context: SchematicContext) => {
    try {
      // use dynamic import to properly raise an exception if it is not an Otter project.
      const { applyEsLintFix, install, ngAddPackages, getO3rPeerDeps } = await import('@o3r/schematics');

      // retrieve dependencies following the /^@o3r\/.*/ pattern within the peerDependencies of the current module
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, 'path', 'to', 'package.json'));
      return chain([
        // optional custom action dedicated to this module
        doCustomAction(),
        options.skipLinter ? noop() : applyEsLintFix(),
        // install ngx-translate and message format dependencies
        options.skipInstall ? noop : install,
        // add the missing Otter modules in the current project
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: `${depsInfo.packageName!} - setup` })
      ]);
    } catch (e) {
      // If the installation is initialized in a non-Otter application, mandatory packages will be missing. We need to notify the user
      context.logger.error(`[ERROR]: Adding MyModule has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the MyModule package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
```

### Register your module as official module

It could make sense that the developed module would be part of the modules proposed at the beginning of the Otter application.
To provide the module at Otter installation, it is necessary to create a Pull Request to the [Otter repository](https://github.com/AmadeusITGroup/otter) that follows the steps below:

1. Ask to the user if the module should be part of this installation:

```json5
// in packages/@o3r/core/schematics/ng-add/schema.json

{
  "$schema": "http://json-schema.org/schema",
  "$id": "ngAddSchematicsSchema",
  "title": "Add Otter library",
  "description": "ngAdd Otter library",
  "properties": {
    "enableMyModule": {
      "type": "boolean",
      "default": false,
      "description": "Installation of myModule",
      "x-prompt": "Activate my module doing some stuff in your new application ?"
    }
  }
}
```

2. Add the conditional installation to the `ng-add` process

```typescript
// in packages/@o3r/core/schematics/ng-add/index.ts

import { chain, noop, Rule } from '@angular-devkit/schematics';
import { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter library to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {

  // add the module within the external packages list
  const externalPackagesToInstallWithNgAdd = Array.from(new Set([
    ...(options.enableMyModule ? ['@my/module'] : [])
  ]));


}
```

3. Register the module within [packageGroup](https://github.com/angular/angular-cli/blob/main/docs/specifications/update.md) to trigger the module upgrade with the Otter Framework upgrade.

```json5
// in packages/@o3r/core/package.json

{
  "name": "@o3r/core",
  "version": "0.0.0-placeholder",
  "ng-update": {
    "migrations": "./dist/migration.json",
    "packageGroup": [
      "@my/module" // add the module in the list
    ]
  }
}
```
