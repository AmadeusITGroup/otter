import {
  basename
} from 'node:path';
import type {
  Rule
} from '@angular-devkit/schematics';

const getNodeBuilder = (obj: any, refs: any[] = []): any[] => {
  if (Object.keys(obj).includes('builder') && obj.builder === '@o3r/design:generate-css') {
    refs.push(obj);
    return refs;
  }

  return Object.values(obj).reduce((acc: any[], value) => {
    if (Array.isArray(value)) {
      return value
        .filter((v) => typeof v === 'object' && v !== null)
        .reduce((acc2, v) => getNodeBuilder(v, acc2), acc);
    } else if (typeof value === 'object' && value !== null) {
      return getNodeBuilder(value, acc);
    }
    return acc;
  }, refs);
};

export const migrateBuilderToGenerateStyle: Rule = (tree, context) => {
  tree.visit((path) => {
    if (['angular.json', 'project.json', 'nx.json'].includes(basename(path))) {
      try {
        const contentObj: any = tree.readJson(path);
        const refs = getNodeBuilder(contentObj);
        if (refs.length === 0) {
          return;
        }

        refs.forEach((ref) => {
          ref.builder = '@o3r/design:generate-style';
          if (ref.options) {
            ref.options.language = 'css';
          }
        });
        tree.overwrite(path, JSON.stringify(contentObj, null, 2));
      } catch {
        context.logger.warn(`Failed to parse '${path}'`);
      }
    }
  });

  return tree;
};
