import {
  chain,
} from '@angular-devkit/schematics';
import {
  setupSchematicsParamsForProject,
} from '@o3r/schematics';
import type {
  WorkspaceSchematics,
} from '@o3r/schematics';
import {
  defaultPresetRuleFactory,
} from './helpers';

const skipWorkspaceFeature = {
  skipVscodeTools: true,
  skipRenovate: true,
  skipPreCommitChecks: true
};

/**
 * Default preset with the basic of Otter Framework (no additional modules)
 */
export function basicPreset() {
  return {
    rule: chain([
      setupSchematicsParamsForProject({ '@o3r/workspace:ng-add': skipWorkspaceFeature } as WorkspaceSchematics),
      defaultPresetRuleFactory([])
    ])
  };
}
