import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  updateImports,
} from '@o3r/schematics';

/**
 * Update the Rule Engine service name
 */
export function updateRuleEngineService(): Rule {
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
  }, undefined, true);
}
