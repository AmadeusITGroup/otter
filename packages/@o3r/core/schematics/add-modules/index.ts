import { chain, externalSchematic, noop, Rule } from '@angular-devkit/schematics';
import type { NgAddModulesSchematicsSchema } from './schema';
import { askConfirmation, askQuestion } from '@angular/cli/src/utilities/prompt';
import { createSchematicWithMetricsIfInstalled, getAvailableModulesWithLatestPackage, getWorkspaceConfig, OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES } from '@o3r/schematics';
import { getExternalPreset, presets } from '../shared/presets';

/**
 * Select the available modules to add to the project
 * @param options
 */
function ngAddModulesFn(options: NgAddModulesSchematicsSchema): Rule {
  return async (tree, context) => {
    if (!context.interactive && !options.preset && !options.externalPresets) {
      context.logger.error('This command is available only for interactive shell, only the "preset" option can be used without interaction');
      return () => tree;
    }

    const { preset, externalPresets, ...forwardOptions } = options;
    const presetRunner = preset ? await presets[preset]({ forwardOptions }) : undefined;
    const externalPresetRunner = externalPresets ? await getExternalPreset(externalPresets, tree, context)?.({ projectName: forwardOptions.projectName, forwardOptions }) : undefined;
    const mods = [...new Set([...(presetRunner?.modules || []), ...(externalPresetRunner?.modules || [])])];
    if (mods.length) {
      context.logger.info(`The following modules will be installed: ${mods.join(', ')}`);
      if (context.interactive && !await askConfirmation('Would you like to process to the setup of these modules?', true)) {
        return;
      }
    }
    if (presetRunner || externalPresetRunner) {
      return () => chain([
        presetRunner?.rule || noop(),
        externalPresetRunner?.rule || noop()
      ])(tree, context);
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
        return externalSchematic(res, 'ng-add', forwardOptions);
      }
    } catch (e: any) {
      context.logger.debug('Error during the module discovery', e);
      context.logger.error('List of Otter modules unavailable');
    }
    return () => tree;

  };
}

/**
 * Select the available modules to add to the project
 * @param options
 */
export const ngAddModules = createSchematicWithMetricsIfInstalled(ngAddModulesFn);
