import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

/**
 * Add import to a module in a NgModule
 * @param appFolderPath root of the app
 * @param moduleName name of the module to import
 * @param modulePath path of the module to import
 */
export function addImportToAppModule(appFolderPath: string, moduleName: string, modulePath: string) {
  const appModuleFilePath = path.join(appFolderPath, 'src/app/app.module.ts');
  const appModule = readFileSync(appModuleFilePath).toString();
  const relativeModulePath = path.relative(path.dirname(appModuleFilePath), path.join(appFolderPath, modulePath)).replace(/\\+/g, '/');
  writeFileSync(appModuleFilePath, `import { ${moduleName} } from '${relativeModulePath}';\n${
    appModule.replace(/(BrowserModule,)/, `$1\n    ${moduleName},`)
  }`);
}
