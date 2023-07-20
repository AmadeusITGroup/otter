import type { Rule } from '@angular-devkit/schematics';
import { EOL } from 'node:os';

/**
 * Display the list of available Otter modules
 *
 * @param keyword Keyword to search for Otter modules
 * @param scopeWhitelist List of whitelisted scopes
 * @param onlyCmsModules Display only the Otter modules with CMS administration
 * @param onlyNotInstalledModules Display only the Otter modules that are not already installed
 */
export function displayModuleList(keyword: string, scopeWhitelist: string[] | readonly string[], onlyCmsModules = false, onlyNotInstalledModules = false): Rule {
  return async (tree, context) => {
    const { OTTER_KEYWORD_CMS } = await import('@o3r/schematics');
    const tagMap: Record<string, string> = { [OTTER_KEYWORD_CMS]: 'CMS enabler' };

    const { getAvailableModulesWithLatestPackage, formatModuleDescription, getWorkspaceConfig, getPackageManagerExecutor } = await import('@o3r/schematics');
    const workspaceConfig = getWorkspaceConfig(tree);
    try {
      const modules = await getAvailableModulesWithLatestPackage(keyword, {
        scopeWhitelist,
        onlyNotInstalled: onlyNotInstalledModules,
        logger: context.logger,
        workspaceConfig
      });
      const message = modules
        .filter((mod) => !onlyCmsModules || mod.keywords?.includes(OTTER_KEYWORD_CMS))
        .map((mod) => formatModuleDescription(mod, getPackageManagerExecutor(workspaceConfig), tagMap))
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
