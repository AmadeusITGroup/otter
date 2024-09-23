import { type JsonArray, type JsonObject } from '@angular-devkit/core';
import { apply, MergeStrategy, mergeWith, renameTemplateFiles, type Rule, template, url } from '@angular-devkit/schematics';

/**
 * Update or add tsconfig.eslint.json file
 * @param projectTsConfig
 * @param rootPath
 */
export const updateOrAddTsconfigEslint = (projectTsConfig = 'tsconfig', rootPath = __dirname): Rule => async (tree) => {
  const tsconfigPath = 'tsconfig.eslint.json';
  if (tree.exists(tsconfigPath)) {
    const tsconfig = tree.readJson(tsconfigPath) as JsonObject;
    tsconfig.include = (tsconfig.include as JsonArray || []).concat(`eslint*.config.*js`);
    tree.overwrite(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    return () => tree;
  }
  const { getTemplateFolder } = await import('@o3r/schematics');
  return () => mergeWith(apply(url(getTemplateFolder(rootPath, __dirname)), [
    template({ projectTsConfig }),
    renameTemplateFiles()
  ]), MergeStrategy.Overwrite);
};
