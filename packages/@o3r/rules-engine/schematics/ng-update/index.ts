import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import {
  updateRuleEngineService
} from './v10.0/action-module-split';

/**
 * update of Otter library V10.0
 */
export function updateV100(): Rule {
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
