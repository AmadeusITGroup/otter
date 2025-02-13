import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
} from '@o3r/schematics';
import {
  updateRuleEngineService,
} from './v10.0/action-module-split';
import {
  useRegisterActionHandlers,
} from './v11.6/use-register-action-handlers';

function updateV100Fn(): Rule {
  return (tree, context) => {
    const updateRules: Rule[] = [
      updateRuleEngineService(),
      (_, ctx) => {
        ctx.logger.warn('The Rules Engine executors are now split in their dedicated modules.');
        ctx.logger.warn('please refer to https://github.com/AmadeusITGroup/otter/blob/main/docs/rules-engine/how-to-use/integration.md#action-executor-modules');
      }
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V10.0
 */
export const updateV100 = createOtterSchematic(updateV100Fn);

function updateV116Fn(): Rule {
  return chain([
    useRegisterActionHandlers
  ]);
}

/**
 * Update of Otter library V11.6
 */
export const updateV116 = createOtterSchematic(updateV116Fn);
