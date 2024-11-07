import {
  EOL,
} from 'node:os';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  getPackageManagerExecutor,
  getWorkspaceConfig,
} from '../utility/index';
import {
  OTTER_KEYWORD_CMS,
  OTTER_MODULE_KEYWORD,
  OTTER_MODULE_SUPPORTED_SCOPES,
} from './modules.constants';
import {
  formatModuleDescription,
  getAvailableModulesWithLatestPackage,
} from './modules.helpers';

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

        context.logger.info(EOL + message);
      }
    } catch (e: any) {
      context.logger.debug('Error during the module discovery', e);
      context.logger.error('List of Otter modules unavailable');
    }
    return () => tree;
  };
}
