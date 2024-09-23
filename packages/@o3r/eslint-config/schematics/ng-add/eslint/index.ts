import type { JsonObject } from '@angular-devkit/core';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  renameTemplateFiles,
  type Rule,
  template,
  url
} from '@angular-devkit/schematics';
import * as path from 'node:path';
import { updateOrAddTsconfigEslint } from '../tsconfig/index';

/**
 * Update ESLint Config
 * @param isWorkspace
 * @param rootPath
 */
export const updateEslintConfig = (isWorkspace = true, rootPath = __dirname): Rule => async (tree, context) => {
  const { findFilesInTree, getTemplateFolder } = await import('@o3r/schematics');
  const eslintConfigFiles = findFilesInTree(tree.root, (file) => /eslint.config.[mc]?js/.test(file));
  if (eslintConfigFiles.length > 1) {
    context.logger.warn(
      'Unable to add the "@o3r/eslint-config" recommendation because several ESLint config file detected.\n'
      + eslintConfigFiles.map((file) => `\t- ${file.path.toString()}`).join('\n')
    );
    return;
  }
  const templateOptions = {
    extension: 'mjs',
    codeBeforeConfig: '',
    codeAfterConfig: '',
    oldConfig: '',
    packageName: (tree.readJson('package.json') as JsonObject).name,
    detectedTsConfigs: findFilesInTree(tree.root, (f) => /tsconfig.*\.json/.test(f)).map((entry) => path.basename(entry.path)).concat('tsconfig.eslint.json')
  };
  if (eslintConfigFiles.length === 1) {
    const file = eslintConfigFiles[0];
    const filePath = file.path.toString();
    const fileContent = file.content.toString();
    const extension = path.extname(filePath) as 'mjs' | 'cjs' | 'js';
    const regexp = extension === 'mjs' ? /export\s+default\s+[^;]*;/ : /module.exportss+=\s+[^;]*;/;
    const [codeBeforeConfig, codeAfterConfig] = fileContent.split(regexp);
    if (!codeAfterConfig) {
      context.logger.warn(
        `Unable to add the "@o3r/eslint-config" recommendation because no ESLint config detected in ${filePath}`
      );
      return;
    }
    const oldConfig = fileContent.match(regexp)![1];
    templateOptions.extension = extension;
    templateOptions.codeBeforeConfig = codeBeforeConfig;
    templateOptions.codeAfterConfig = codeAfterConfig;
    templateOptions.oldConfig = oldConfig;
    tree.delete(filePath);
  }

  return chain([
    updateOrAddTsconfigEslint(undefined, __dirname),
    mergeWith(apply(url(getTemplateFolder(rootPath, __dirname, `./templates/${isWorkspace ? 'workspace' : 'project'}`)), [
      template(templateOptions),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite)
  ]);
};
