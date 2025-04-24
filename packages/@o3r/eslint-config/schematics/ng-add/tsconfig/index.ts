import {
  type JsonArray,
  type JsonObject,
} from '@angular-devkit/core';
import {
  apply,
  MergeStrategy,
  mergeWith,
  renameTemplateFiles,
  type Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import {
  getTemplateFolder,
} from '@o3r/schematics';
/**
 * Update or add tsconfig.eslint.json file
 * @param rootPath
 * @param projectTsConfig
 */
export const updateOrAddTsconfigEslint = (rootPath: string, projectTsConfig = 'tsconfig'): Rule => (tree) => {
  const tsconfigPath = 'tsconfig.eslint.json';
  if (tree.exists(tsconfigPath)) {
    const tsconfig = tree.readJson(tsconfigPath) as JsonObject;
    tsconfig.include = (tsconfig.include as JsonArray || []).concat(`eslint*.config.*js`);
    tree.overwrite(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    return () => tree;
  }

  return () => mergeWith(apply(url(getTemplateFolder(rootPath, __dirname)), [
    template({ projectTsConfig }),
    renameTemplateFiles()
  ]), MergeStrategy.Overwrite);
};
