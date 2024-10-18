import {
  type Rule
} from '@angular-devkit/schematics';

export const updateO3rMetricsConfig: Rule = (tree) => {
  tree.visit((path, entry) => {
    if (path.endsWith('package.json') && entry) {
      const content = JSON.parse(entry.content.toString());
      if (typeof content.config?.o3rMetrics !== 'undefined') {
        content.config.o3r ||= {};
        content.config.o3r.telemetry = content.config.o3rMetrics;
        delete content.config.o3rMetrics;
        tree.overwrite(path, JSON.stringify(content, null, 2));
      }
    }
  });
  return tree;
};
