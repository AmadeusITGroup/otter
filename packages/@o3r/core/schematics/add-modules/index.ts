import { externalSchematic, Rule } from '@angular-devkit/schematics';
import { NgAddModulesSchematicsSchema } from './schema';
import { askQuestion } from '@angular/cli/src/utilities/prompt';
import { getAvailableModulesWithLatestPackage, getWorkspaceConfig, OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES } from '@o3r/schematics';
import { presets } from '../shared/presets';

/**
 * Select the available modules to add to the project
 *
 * @param options
 */
export function ngAddModules(options: NgAddModulesSchematicsSchema): Rule {
  return async (tree, context) => {
    if (!context.interactive && options.preset === 'none') {
      context.logger.error('This command is available only for interactive shell, only the "preset" option can be used without interaction');
      return () => tree;
    }

    if (options.preset !== 'none') {
      const { preset, ...forwardOptions } = options;
      const presetRunner = await presets[preset]({ forwardOptions });
      if (presetRunner.modules) {
        context.logger.info(`The following modules will be installed: ${presetRunner.modules.join(', ')}`);
      }
      return presetRunner.rule;
    }

    try {
      const modules = await getAvailableModulesWithLatestPackage(OTTER_MODULE_KEYWORD, {
        scopeWhitelist: OTTER_MODULE_SUPPORTED_SCOPES,
        onlyNotInstalled: true,
        logger: context.logger,
        workspaceConfig: getWorkspaceConfig(tree)
      });
      if (modules.length === 0) {
        context.logger.warn('There is no additional available module');
        return () => tree;
      }

      const res = await askQuestion('Choose the modules to install:', modules.map((mod) => ({
        type: 'choice',
        name: mod.name,
        value: mod.name,
        short: mod.description
      })), 0, null);

      if (res) {
        return externalSchematic(res, 'ng-add', {});
      }
    } catch (e: any) {
      context.logger.debug('Error during the module discovery', e);
      context.logger.error('List of Otter modules unavailable');
    }
    return () => tree;

  };
}
