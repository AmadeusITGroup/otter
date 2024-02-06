import type { Rule } from '@angular-devkit/schematics';
import { updateImports } from '@o3r/schematics';

/**
 * Update the Rule Engine service name
 */
export function updateRuleEngineService(): Rule {
  /* eslint-disable @typescript-eslint/naming-convention */
  return updateImports({
    '@o3r/rules-engine': {
      RulesEngineService: {
        newPackage: '@o3r/rules-engine',
        newValue: 'RulesEngineRunnerService'
      },
      RulesEngineModule: {
        newPackage: '@o3r/rules-engine',
        newValue: 'RulesEngineRunnerModule'
      }
    }
  });
  /* eslint-enable @typescript-eslint/naming-convention */
}
