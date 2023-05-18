import { Rule } from '@angular-devkit/schematics';
import { NgShowModulesSchematicsSchema } from './schema';
import { displayModuleList } from '../rule-factories/module-list';
import type { OTTER_MODULE_KEYWORD as OTTER_MODULE_KEYWORD_TYPE, OTTER_MODULE_SUPPORTED_SCOPES as OTTER_MODULE_SUPPORTED_SCOPES_TYPE } from '@o3r/core';

// TODO: Remove this workaround when #374 is implemented
const OTTER_MODULE_KEYWORD: typeof OTTER_MODULE_KEYWORD_TYPE = 'otter-module';

// TODO: Remove this workaround when #374 is implemented
const OTTER_MODULE_SUPPORTED_SCOPES: typeof OTTER_MODULE_SUPPORTED_SCOPES_TYPE = ['otter', 'o3r'];

/**
 * Show the list of available modules
 *
 * @param options
 */
export function ngShowModules(options: NgShowModulesSchematicsSchema): Rule {
  return displayModuleList(OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES, options.cmsOnly, options.hideInstalledModule);
}
