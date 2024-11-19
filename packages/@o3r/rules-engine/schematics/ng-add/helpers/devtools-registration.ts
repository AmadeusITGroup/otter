import { chain, Rule } from '@angular-devkit/schematics';
import * as path from 'node:path';
import type { NgAddSchematicsSchema } from '../schema';
import { readFileSync } from 'node:fs';
import { registerDevtoolsToApplication } from '@o3r/schematics';

const DEVTOOL_MODULE_NAME = 'RulesEngineDevtoolsModule';
const MESSAGE_DEVTOOL_SERVICE_NAME = 'RulesEngineDevtoolsMessageService';
const CONSOLE_DEVTOOL_SERVICE_NAME = 'RulesEngineDevtoolsConsoleService';
const PACKAGE_NAME: string = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), { encoding: 'utf8' })).name;

/**
 * Register Devtools to the application
 * @param tree
 * @param context
 * @param options
 * @param options.projectName
 */
export const registerDevtools = (options: NgAddSchematicsSchema): Rule => {
  return chain([
    registerDevtoolsToApplication({
      moduleName: DEVTOOL_MODULE_NAME,
      packageName: PACKAGE_NAME,
      serviceName: MESSAGE_DEVTOOL_SERVICE_NAME,
      projectName: options.projectName
    }),
    registerDevtoolsToApplication({
      moduleName: DEVTOOL_MODULE_NAME,
      packageName: PACKAGE_NAME,
      serviceName: CONSOLE_DEVTOOL_SERVICE_NAME,
      projectName: options.projectName
    })
  ]);
};
