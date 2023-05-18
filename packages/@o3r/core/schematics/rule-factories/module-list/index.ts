import type { Rule } from '@angular-devkit/schematics';
import { EOL } from 'node:os';
import type { OTTER_KEYWORD_CMS as OTTER_KEYWORD_CMS_TYPE } from '@o3r/core';

// TODO: Remove this workaround when #374 is implemented
const OTTER_KEYWORD_CMS: typeof OTTER_KEYWORD_CMS_TYPE = 'otter-cms';

/**
 * Display the list of available Otter modules
 *
 * @param keyword Keyword to search for Otter modules
 * @param scopeWhitelist List of whitelisted scopes
 * @param onlyCmsModules Display only the Otter modules with CMS administration
 * @param onlyNotInstalledModules Display only the Otter modules that are not already installed
 */
export function displayModuleList(keyword: string, scopeWhitelist: string[] | readonly string[], onlyCmsModules = false, onlyNotInstalledModules = false): Rule {
  const tagMap: Record<string, string> = onlyCmsModules ? {} : { [OTTER_KEYWORD_CMS]: 'CMS enabler' };

  return async (tree, context) => {
    const { getAvailableModulesWithLatestPackage, formatModuleDescription } = await import('@o3r/schematics');
    try {
      const modules = await getAvailableModulesWithLatestPackage(keyword, scopeWhitelist, onlyNotInstalledModules, context.logger);
      const message = modules
        .filter((mod) => !onlyCmsModules || mod.keywords?.includes(OTTER_KEYWORD_CMS))
        .map((mod) => formatModuleDescription(mod, process.env?.npm_execpath?.indexOf('yarn') === -1 ? 'npx' : 'yarn', tagMap))
        .filter((msg) => !!msg)
        .join(EOL + EOL);
      if (message) {
        context.logger.info('The following modules are now available for your application, add them according to your needs:');
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        context.logger.info(EOL + message);
      }
    } catch (e: any) {
      context.logger.debug('Error during the module discovery', e);
      context.logger.error('List of Otter modules unavailable');
    }
    return () => tree;
  };
}
