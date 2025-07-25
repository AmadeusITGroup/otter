import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
} from '@o3r/schematics';
import {
  addPresetsRenovate,
} from './v10.1/add-presets-renovate';
import {
  updateRenovateVersion,
} from './v12.1/renovate-version';

/**
 * Update of Otter Workspace V10.1
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version number
function updateV10_1Fn(): Rule {
  const updateRules: Rule[] = [
    addPresetsRenovate()
  ];
  return chain(updateRules);
}

/**
 * Update of Otter Workspace V10.1
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version number
export const updateV10_1 = createOtterSchematic(updateV10_1Fn);

/**
 * Update of Otter Workspace V12.1
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version number
function updateV12_1Fn(): Rule {
  const updateRules: Rule[] = [
    updateRenovateVersion()
  ];
  return chain(updateRules);
}

/**
 * Update of Otter Workspace V12.1
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- function name contains the version number
export const updateV12_1 = createOtterSchematic(updateV12_1Fn);
