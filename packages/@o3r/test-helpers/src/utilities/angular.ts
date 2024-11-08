import {
  existsSync,
} from 'node:fs';
import {
  readFile,
  writeFile,
} from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Add import to a module in the root NgModule.
 * In case of standalone app, import the module in the root component
 * @param appFolderPath root of the app
 * @param moduleName name of the module to import
 * @param modulePath path of the module to import
 */
export async function addImportToAppModule(appFolderPath: string, moduleName: string, modulePath: string) {
  let appModuleFilePath = path.join(appFolderPath, 'src/app/app.module.ts');
  if (!existsSync(appModuleFilePath)) {
    // assume standalone component
    appModuleFilePath = path.join(appFolderPath, 'src/app/app.component.ts');
  }
  const appModule = await readFile(appModuleFilePath, { encoding: 'utf8' });
  const relativeModulePath = path.relative(path.dirname(appModuleFilePath), path.join(appFolderPath, modulePath)).replace(/\\+/g, '/');
  await writeFile(appModuleFilePath, `import { ${moduleName} } from '${relativeModulePath}';\n${
    appModule.replace(/(imports:\s*\[\s*)/, `$1\n    ${moduleName},`)
  }`);
}

/**
 * Force Angular version in package.json to use tilde instead of caret
 * @param appFolderPath
 */
export async function fixAngularVersion(appFolderPath: string) {
  const workspacePackageJsonPath = path.join(appFolderPath, 'package.json');
  const packageJsonString = await readFile(workspacePackageJsonPath, { encoding: 'utf8' });
  await writeFile(workspacePackageJsonPath, packageJsonString.replace(/(@(?:angular|schematics).*)\^/g, '$1~'));
}
