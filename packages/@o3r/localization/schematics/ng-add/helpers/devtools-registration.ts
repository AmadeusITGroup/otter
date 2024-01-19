import { chain, Rule } from '@angular-devkit/schematics';
import * as path from 'node:path';
import type { NgAddSchematicsSchema } from '../schema';

const DEVTOOL_MODULE_NAME = 'LocalizationDevtoolsModule';
const MESSAGE_DEVTOOL_SERVICE_NAME = 'LocalizationDevtoolsMessageService';
const CONSOLE_DEVTOOL_SERVICE_NAME = 'LocalizationDevtoolsConsoleService';
const PACKAGE_NAME: string = require(path.resolve(__dirname, '..', '..', '..', 'package.json')).name;

/**
 * Register Devtools to the application
 * @param tree
 * @param context
 * @param options
 * @param options.projectName
 */
export const registerDevtools = async (options: NgAddSchematicsSchema): Promise<Rule> => {
  const { registerDevtoolsToApplication } = await import('@o3r/schematics');
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
