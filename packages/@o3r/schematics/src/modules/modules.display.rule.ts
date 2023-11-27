import type { Rule } from '@angular-devkit/schematics';
import { EOL } from 'node:os';
import {OTTER_KEYWORD_CMS, OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES} from './modules.constants';
import { getPackageManagerExecutor, getWorkspaceConfig } from '../utility';
import { formatModuleDescription, getAvailableModulesWithLatestPackage } from './modules.helpers';

/** Options for the Display Module rule */
export interface DisplayModuleListOptions {
  /**
   * List of whitelisted scopes
   * @default {@see OTTER_MODULE_SUPPORTED_SCOPES}
   */
  scopeWhitelist: string[] | readonly string[];
  /**
   * Keyword to search for Otter modules
   * @default {@see OTTER_MODULE_KEYWORD}
   */
  keyword: string;
  /** Display only the Otter modules with CMS administration */
  onlyCmsModules: boolean;
  /** Display only the Otter modules that are not already installed */
  onlyNotInstalledModules: boolean;
  /** Name of the package where to install add the dependency */
  packageName: string;
}

/**
 * Display the list of available Otter modules
 * @param options Options of the Display Module list
 */
export function displayModuleListRule(options?: Partial<DisplayModuleListOptions>): Rule {

  const scopeWhitelist = options?.scopeWhitelist || OTTER_MODULE_SUPPORTED_SCOPES;
  const keyword = options?.keyword || OTTER_MODULE_KEYWORD;

  return async (tree, context) => {
    const tagMap: Record<string, string> = { [OTTER_KEYWORD_CMS]: 'CMS enabler' };

    // const { getAvailableModulesWithLatestPackage, formatModuleDescription, getWorkspaceConfig, getPackageManagerExecutor } = await import('@o3r/schematics');
    const workspaceConfig = getWorkspaceConfig(tree);
    try {
      const modules = await getAvailableModulesWithLatestPackage(keyword, {
        scopeWhitelist,
        onlyNotInstalled: !!options?.onlyNotInstalledModules,
        logger: context.logger,
        workspaceConfig
      });
      const message = modules
        .filter((mod) => !options?.onlyCmsModules || mod.keywords?.includes(OTTER_KEYWORD_CMS))
        .map((mod) => formatModuleDescription(mod, getPackageManagerExecutor(workspaceConfig, options?.packageName), tagMap))
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

/**
 * @deprecated will be removed in v10, please use {@link displayModuleListRule} instead
 * Display the list of available Otter modules
 * @param keyword
 * @param scopeWhitelist
 * @param onlyCmsModules
 * @param onlyNotInstalledModules
 */
export function displayModuleList(keyword: string, scopeWhitelist: string[] | readonly string[], onlyCmsModules = false, onlyNotInstalledModules = false) {
  return displayModuleListRule({
    keyword,
    onlyCmsModules,
    onlyNotInstalledModules,
    scopeWhitelist
  });
}
