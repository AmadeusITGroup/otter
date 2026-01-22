import {
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  registerDevtoolsToApplication,
} from '@o3r/schematics';
import type {
  NgAddSchematicsSchema,
} from '../schema';

const DEVTOOL_MODULE_NAME = 'StylingDevtoolsModule';
const DEVTOOL_SERVICE_NAME = 'StylingDevtoolsMessageService';
const PACKAGE_NAME: string = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), { encoding: 'utf8' })).name;

/**
 * Register Devtools to the application
 * @param options
 */
export const registerDevtools = (options: NgAddSchematicsSchema) => {
  return registerDevtoolsToApplication({
    moduleName: DEVTOOL_MODULE_NAME,
    packageName: PACKAGE_NAME,
    serviceName: DEVTOOL_SERVICE_NAME,
    projectName: options.projectName
  });
};
