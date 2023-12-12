/* eslint-disable @typescript-eslint/naming-convention */
import { Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';

/**
 * If ng-package.json is found under the /src/ folder of the module, it means sub entry points mechanism is implemented
 * @param tree tree
 * @param destination the destination path
 */
export function moduleHasSubEntryPoints(tree: Tree, destination: string) {
  return tree.exists(path.join(destination, 'ng-package.json'));
}
/**
 * Checks if exists and returns the 'store' project from angular.json.
 * Otherwise, it returns the default project if exists, if not it returns the first project
 * @param tree tree
 * @param destination the destination path
 * @param entityName the entity name
 */
export function writeSubEntryPointPackageJson(tree: Tree, destination: string, entityName: string) {
  if (!tree.exists(path.join(destination, 'package.json'))) {
    const ngPackagerPath = path.join(destination, 'ng-package.json');
    const ngPackagerObj = tree.exists(ngPackagerPath) && JSON.parse(tree.read(ngPackagerPath)!.toString());

    const umdModuleIds = ngPackagerObj?.lib?.umdModuleIds || {
      '@otter/core': 'otter-core',
      '@otter/common': 'otter-common',
      '@dapi/sdk': 'dapi-sdk',
      '@dapi/sdk-core': 'dapi-sdk-core',
      '@ngrx/store': 'ngrx-store',
      '@ngrx/effects': 'ngrx-effects',
      '@ngrx/entity': 'ngrx-entity',
      '@ngrx/router-store': 'ngrx-router-store',
      '@dapi/sdk/helpers': 'dapi-sdk-helpers'
    };
    const packageJson = {
      ngPackage: {
        dest: './',
        lib: {
          entryFile: 'index.ts',
          umdModuleIds
        }
      }
    };
    tree.create(path.join(destination, entityName, 'package.json'), JSON.stringify(packageJson, null, 2));
  }
}
