import { Rule } from '@angular-devkit/schematics';
import { NgShowModulesSchematicsSchema } from './schema';
import { displayModuleList } from '../rule-factories/module-list';

/**
 * Show the list of available modules
 *
 * @param options
 */
export async function ngShowModules(options: NgShowModulesSchematicsSchema): Promise<Rule> {
  const { OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES } = await import('@o3r/schematics');
  return displayModuleList(OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES, options.cmsOnly, options.hideInstalledModule);
}
