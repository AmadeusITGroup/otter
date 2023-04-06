import { apply, chain, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';

import {
  applyEsLintFix,
  getComponentConfigKey,
  getComponentConfigName,
  getComponentFileName,
  getComponentFolderName,
  getComponentModuleName,
  getComponentName,
  getComponentSelectorWithoutSuffix,
  getDestinationPath,
  getInputComponentName,
  getProjectFromTree
} from '@o3r/schematics';
import * as path from 'node:path';
import { NgGenerateIframeComponentSchematicsSchema } from './schema';

const IFRAME_TEMPLATE_PATH = './templates/iframe';
const MODULE_TEMPLATE_PATH = './templates/module';
const CONFIG_TEMPLATE_PATH = './templates/config';

/**
 * Generates the template properties
 *
 * @param options
 * @param prefix
 */
const getTemplateProperties = (options: NgGenerateIframeComponentSchematicsSchema, prefix: string) => {

  const inputComponentName = getInputComponentName(options.componentName);
  const folderName = getComponentFolderName(inputComponentName);

  return {
    ...options,
    componentType: options.useOtterConfig ? 'ExposedComponent' : 'Component',
    projectName: options.projectName || undefined,
    moduleName: getComponentModuleName(inputComponentName, ''),
    componentName: getComponentName(inputComponentName, ''),
    componentConfig: getComponentConfigName(inputComponentName, ''),
    componentSelector: getComponentSelectorWithoutSuffix(options.componentName, prefix),
    folderName,
    name: getComponentFileName(options.componentName, ''),
    configKey: getComponentConfigKey(options.componentName, ''),
    description: options.description || ''
  };
};

/**
 * Generate an ifrmare component for third party script integration
 *
 * @param options
 */
export function ngGenerateIframeComponent(options: NgGenerateIframeComponentSchematicsSchema): Rule {

  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {

    const workspaceProject = getProjectFromTree(tree);

    const properties = getTemplateProperties(options, options.prefix ? options.prefix : workspaceProject.prefix);

    const destination = getDestinationPath('@o3r/core:component', options.path, tree);
    const componentDestination = path.join(destination, properties.folderName);

    const rules: Rule[] = [];

    rules.push(mergeWith(apply(url(IFRAME_TEMPLATE_PATH), [
      template({
        ...properties
      }),
      renameTemplateFiles(),
      move(componentDestination)
    ]), MergeStrategy.Overwrite));

    if (!options.standalone) {
      rules.push(mergeWith(apply(url(MODULE_TEMPLATE_PATH), [
        template({
          ...properties
        }),
        renameTemplateFiles(),
        move(componentDestination)
      ]), MergeStrategy.Overwrite));
    }

    if (options.useOtterConfig) {
      rules.push(mergeWith(apply(url(CONFIG_TEMPLATE_PATH), [
        template({
          ...properties
        }),
        renameTemplateFiles(),
        move(componentDestination)
      ]), MergeStrategy.Overwrite));
    }

    return chain(rules)(tree, context);
  };

  return chain([
    generateFiles,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}
