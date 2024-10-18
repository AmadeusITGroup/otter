import {
  Rule
} from '@angular-devkit/schematics';
import {
  createSchematicWithMetricsIfInstalled,
  displayModuleListRule,
  OTTER_MODULE_KEYWORD,
  OTTER_MODULE_SUPPORTED_SCOPES
} from '@o3r/schematics';
import {
  NgShowModulesSchematicsSchema
} from './schema';

/**
 * Show the list of available modules
 * @param options
 */
function ngShowModulesFn(options: NgShowModulesSchematicsSchema): Rule {
  return displayModuleListRule({ keyword: OTTER_MODULE_KEYWORD, scopeWhitelist: OTTER_MODULE_SUPPORTED_SCOPES, onlyCmsModules: options.cmsOnly, onlyNotInstalledModules: options.hideInstalledModule });
}

/**
 * Show the list of available modules
 * @param options
 */
export const ngShowModules = createSchematicWithMetricsIfInstalled(ngShowModulesFn);
