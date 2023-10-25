import { Rule } from '@angular-devkit/schematics';
import { NgShowModulesSchematicsSchema } from './schema';
import { displayModuleListRule, OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES } from '@o3r/schematics';

/**
 * Show the list of available modules
 * @param options
 */
export function ngShowModules(options: NgShowModulesSchematicsSchema): Rule {
  return displayModuleListRule({ keyword: OTTER_MODULE_KEYWORD, scopeWhitelist: OTTER_MODULE_SUPPORTED_SCOPES, onlyCmsModules: options.cmsOnly, onlyNotInstalledModules: options.hideInstalledModule });
}
