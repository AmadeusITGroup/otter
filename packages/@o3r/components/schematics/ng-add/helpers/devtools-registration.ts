import {
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  Rule,
} from '@angular-devkit/schematics';
import type {
  NgAddSchematicsSchema,
} from '../schema';

const DEVTOOL_MODULE_NAME = 'ComponentsDevtoolsModule';
const DEVTOOL_SERVICE_NAME = 'ComponentsDevtoolsMessageService';
const PACKAGE_NAME: string = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), { encoding: 'utf8' })).name;

/**
 * Register Devtools to the application
 * @param options
 */
export const registerDevtools = async (options: NgAddSchematicsSchema): Promise<Rule> => {
  const { registerDevtoolsToApplication } = await import('@o3r/schematics');
  return registerDevtoolsToApplication({
    moduleName: DEVTOOL_MODULE_NAME,
    packageName: PACKAGE_NAME,
    serviceName: DEVTOOL_SERVICE_NAME,
    projectName: options.projectName
  });
};
