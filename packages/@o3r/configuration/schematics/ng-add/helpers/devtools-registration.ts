import {
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  chain,
} from '@angular-devkit/schematics';
import {
  registerDevtoolsToApplication,
} from '@o3r/schematics';
import type {
  NgAddSchematicsSchema,
} from '../schema';

const DEVTOOL_MODULE_NAME = 'ConfigurationDevtoolsModule';
const MESSAGE_DEVTOOL_SERVICE_NAME = 'ConfigurationDevtoolsMessageService';
const CONSOLE_DEVTOOL_SERVICE_NAME = 'ConfigurationDevtoolsConsoleService';
const PACKAGE_NAME: string = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), { encoding: 'utf8' })).name;

/**
 * Register Devtools to the application
 * @param options
 */
export const registerDevtools = (options: NgAddSchematicsSchema) => {
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
