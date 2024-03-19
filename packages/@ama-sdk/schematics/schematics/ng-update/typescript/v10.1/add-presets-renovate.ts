import type { Rule } from '@angular-devkit/schematics';

const renovatePresets = [
  'github>kpanot/otter//tools/renovate/base',
  'github>kpanot/otter//tools/renovate/sdk'
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
      context.logger.debug('renovate.json not found, skipping preset addition');
    }
    // eslint-disable-next-line max-len
    context.logger.info('To activate the auto-generation based on a dependency package, replace "my-specification-package", in your Renovate configuration, by your specification dependency package name.');
  };
};
