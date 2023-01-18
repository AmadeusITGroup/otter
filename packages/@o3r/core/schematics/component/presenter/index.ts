import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { applyEsLintFix } from '@o3r/schematics';
import * as path from 'node:path';

import {
  getComponentAnalyticsName,
  getComponentBlockName,
  getComponentConfigKey,
  getComponentConfigName,
  getComponentContextName,
  getComponentFileName,
  getComponentFixtureName,
  getComponentFolderName,
  getComponentModuleName,
  getComponentName,
  getComponentSelectorWithoutSuffix,
  getComponentTranslationName, getDestinationPath, getInputComponentName,
  getLibraryNameFromPath, getProjectFromTree
} from '@o3r/schematics';
import { NgGenerateComponentSchematicsSchema } from '../schema';
import { ComponentStructureDef } from '../structures.types';

export const PRESENTER_FOLDER = 'presenter';
const PRESENTER_TEMPLATE_PATH = './templates/presenter';
const FIXTURE_TEMPLATE_PATH = './templates/fixture';
const THEMING_TEMPLATE_PATH = './templates/theming';
const ANALYTICS_TEMPLATE_PATH = './templates/analytics';
const STORYBOOK_TEMPLATE_PATH = './templates/storybook';
const CONTEXT_TEMPLATE_PATH = './templates/context';
const LOCALIZATION_TEMPLATE_PATH = './templates/localization';
const CONFIG_TEMPLATE_PATH = './templates/config';

/**
 * Generates the template properties
 *
 * @param options
 * @param componentStructureDef
 * @param prefix
 */
const getTemplateProperties = (options: NgGenerateComponentSchematicsSchema, componentStructureDef: ComponentStructureDef, prefix: string) => {
  const inputComponentName = getInputComponentName(options.componentName);
  const folderName = getComponentFolderName(inputComponentName);

  return {
    ...options,
    componentType: options.componentStructure === 'full' || !options.useOtterConfig ? 'Component' : 'ExposedComponent',
    moduleName: getComponentModuleName(inputComponentName, componentStructureDef),
    componentName: getComponentName(inputComponentName, componentStructureDef),
    blockName: getComponentBlockName(inputComponentName),
    componentConfig: getComponentConfigName(inputComponentName, componentStructureDef),
    componentTranslation: getComponentTranslationName(inputComponentName, componentStructureDef),
    componentContext: getComponentContextName(inputComponentName, componentStructureDef),
    componentFixture: getComponentFixtureName(inputComponentName, componentStructureDef),
    componentAnalytics: getComponentAnalyticsName(inputComponentName, componentStructureDef),
    componentSelector: getComponentSelectorWithoutSuffix(options.componentName, prefix),
    projectName: options.projectName || getLibraryNameFromPath(options.path),
    folderName,
    name: getComponentFileName(options.componentName, componentStructureDef), // air-offer | air-offer-pres
    configKey: getComponentConfigKey(options.componentName, componentStructureDef), // AIR_OFFER_PRES
    suffix: componentStructureDef.toLowerCase(), // pres | ''
    description: options.description || ''
  };
};

/**
 * Add Otter component to an Angular Project
 *
 * @param options
 */
export function ngGenerateComponentPresenter(options: NgGenerateComponentSchematicsSchema): Rule {

  const fullStructureRequested = options.componentStructure === 'full';

  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {

    const workspaceProject = getProjectFromTree(tree);

    const properties = getTemplateProperties(options, ComponentStructureDef.Pres, options.prefix ? options.prefix : workspaceProject.prefix);

    const destination = getDestinationPath('@o3r/core:component', options.path, tree);
    const componentDestination = path.join(destination, fullStructureRequested ? path.join(properties.folderName, PRESENTER_FOLDER) : properties.folderName);

    const rules: Rule[] = [];

    rules.push(mergeWith(apply(url(PRESENTER_TEMPLATE_PATH), [
      template({
        ...properties
      }),
      renameTemplateFiles(),
      move(componentDestination)
    ]), MergeStrategy.Overwrite));

    if (options.useComponentFixtures) {
      rules.push(mergeWith(apply(url(FIXTURE_TEMPLATE_PATH), [
        template({
          ...properties
        }),
        renameTemplateFiles(),
        move(componentDestination)
      ]), MergeStrategy.Overwrite));
    }

    if (options.useOtterTheming) {
      rules.push(mergeWith(apply(url(THEMING_TEMPLATE_PATH), [
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

    if (options.useOtterAnalytics) {
      rules.push(mergeWith(apply(url(ANALYTICS_TEMPLATE_PATH), [
        template({
          ...properties
        }),
        renameTemplateFiles(),
        move(componentDestination)
      ]), MergeStrategy.Overwrite));
    }

    if (options.useStorybook) {
      rules.push(mergeWith(apply(url(STORYBOOK_TEMPLATE_PATH), [
        template({
          ...properties
        }),
        renameTemplateFiles(),
        move(componentDestination)
      ]), MergeStrategy.Overwrite));
    }

    if (options.useLocalization) {
      rules.push(mergeWith(apply(url(LOCALIZATION_TEMPLATE_PATH), [
        template({
          ...properties
        }),
        renameTemplateFiles(),
        move(componentDestination)
      ]), MergeStrategy.Overwrite));
    }

    if (options.useContext) {
      rules.push(mergeWith(apply(url(CONTEXT_TEMPLATE_PATH), [
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
    !fullStructureRequested ? options.skipLinter ? noop() : applyEsLintFix() : noop
  ]);
}
