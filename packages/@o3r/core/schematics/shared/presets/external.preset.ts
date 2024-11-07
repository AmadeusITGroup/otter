import {
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  getAvailableModules,
  getWorkspaceConfig,
  OTTER_MODULE_PRESET_PREFIX,
  OTTER_MODULE_SUPPORTED_SCOPES,
} from '@o3r/schematics';
import {
  defaultPresetRuleFactory,
} from './helpers';
import type {
  PresetFactory,
} from './preset.interface';

/**
 * Generate the Preset runner for external presets
 * @param externalPresetLabel
 * @param tree
 * @param context
 */
export function getExternalPreset(externalPresetLabel: string, tree: Tree, context: SchematicContext): PresetFactory {
  const presetLabel = `${OTTER_MODULE_PRESET_PREFIX}${externalPresetLabel}`;

  return async (options) => {
    const modules = (await getAvailableModules(presetLabel, OTTER_MODULE_SUPPORTED_SCOPES, { logger: context.logger, workspaceConfig: getWorkspaceConfig(tree) }))
      .map((mod) => mod.name);
    const rule = defaultPresetRuleFactory(modules, options);

    return {
      modules,
      rule
    };
  };
}
