import { externalSchematic, Rule } from '@angular-devkit/schematics';
import { NgAddModulesSchematicsSchema } from './schema';
import { askQuestion } from '@angular/cli/src/utilities/prompt';
import { getAvailableModulesWithLatestPackage, OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES } from '@o3r/schematics';

/**
 * Select the available modules to add to the project
 *
 * @param _options
 */
export function ngAddModules(_options: NgAddModulesSchematicsSchema): Rule {
  return async (tree, context) => {
    if (!context.interactive) {
      context.logger.error('This command is available only for interactive shell');
      return () => tree;
    }

    try {
      const modules = await getAvailableModulesWithLatestPackage(OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES, true, context.logger);
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
