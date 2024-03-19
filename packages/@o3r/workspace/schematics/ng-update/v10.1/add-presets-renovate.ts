import type { Rule } from '@angular-devkit/schematics';

const renovatePresets = [
  'github>kpanot/otter//tools/renovate/base',
  'github>kpanot/otter//tools/renovate/otter-project'
];

export const addPresetsRenovate = (): Rule => {
  return (tree, context) => {
    if (tree.exists('.renovaterc.json')) {
      const renovateConfig = tree.readJson('.renovaterc.json') as any;
      renovateConfig.extends ||= [];
      renovatePresets
        .filter((preset) => !renovateConfig.extends.includes(preset))
        .forEach((preset) => renovateConfig.extends.push(preset));
      tree.overwrite('renovate.json', JSON.stringify(renovateConfig, null, 2));
    } else {
      context.logger.info('renovate.json not found, skipping preset addition');
    }
  };
};
