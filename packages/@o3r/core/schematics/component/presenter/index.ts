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
import { getAddAnalyticsRules } from '../common/analytics';
import { getAddConfigurationRules } from '../common/configuration';
import { getAddContextRules } from '../common/context';
import { getAddFixtureRules } from '../common/fixture';
import { getAddLocalizationRules } from '../common/localization';
import { getAddThemingRules } from '../common/theming';
import { NgGenerateComponentSchematicsSchema } from '../schema';
import { ComponentStructureDef } from '../structures.types';

export const PRESENTER_FOLDER = 'presenter';
const PRESENTER_TEMPLATE_PATH = './templates/presenter';
const MODULE_TEMPLATE_PATH = './templates/module';

/**
 * Generates the template properties
 *
 * @param options
 * @param componentStructureDef
 * @param prefix
 */
const getTemplateProperties = (options: NgGenerateComponentSchematicsSchema, componentStructureDef: ComponentStructureDef, prefix?: string) => {
  const inputComponentName = getInputComponentName(options.componentName);
  const folderName = getComponentFolderName(inputComponentName);

  return {
    ...options,
    componentType: 'Component',
    moduleName: getComponentModuleName(inputComponentName, componentStructureDef),
    componentName: getComponentName(inputComponentName, componentStructureDef),
    blockName: getComponentBlockName(inputComponentName),
    componentTranslation: getComponentTranslationName(inputComponentName, componentStructureDef),
    componentContext: getComponentContextName(inputComponentName, componentStructureDef),
    componentFixture: getComponentFixtureName(inputComponentName, componentStructureDef),
    componentAnalytics: getComponentAnalyticsName(inputComponentName, componentStructureDef),
    componentSelector: getComponentSelectorWithoutSuffix(options.componentName, prefix || null),
    projectName: options.projectName || getLibraryNameFromPath(options.path),
    folderName,
    name: getComponentFileName(options.componentName, componentStructureDef), // air-offer | air-offer-pres
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

  const generateFiles = async (tree: Tree, context: SchematicContext) => {

    const workspaceProject = getProjectFromTree(tree);

    const properties = getTemplateProperties(options, ComponentStructureDef.Pres, options.prefix ? options.prefix : workspaceProject?.prefix);

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

    if (!options.standalone) {
      rules.push(mergeWith(apply(url(MODULE_TEMPLATE_PATH), [
        template({
          ...properties
        }),
        renameTemplateFiles(),
        move(componentDestination)
      ]), MergeStrategy.Overwrite));
    }

    const componentPath = `${properties.name}.component.ts`;

    const configurationRules = await getAddConfigurationRules(
      path.join(componentDestination, componentPath),
      options,
      context
    );
    rules.push(...configurationRules);

    const themingRules = await getAddThemingRules(
      path.join(componentDestination, `${properties.name}.style.scss`),
      options,
      context
    );
    rules.push(...themingRules);

    const localizationRules = await getAddLocalizationRules(
      path.join(componentDestination, componentPath),
      options,
      context
    );
    rules.push(...localizationRules);

    const fixtureRules = await getAddFixtureRules(
      path.join(componentDestination, componentPath),
      options,
      context
    );
    rules.push(...fixtureRules);

    const analyticsRules = await getAddAnalyticsRules(
      path.join(componentDestination, `${properties.name}.component.ts`),
      options,
      context
    );

    rules.push(...analyticsRules);
    const contextRules = await getAddContextRules(
      path.join(componentDestination, componentPath),
      options,
      context
    );
    rules.push(...contextRules);

    return chain(rules);
  };

  return chain([
    generateFiles,
    !fullStructureRequested ? options.skipLinter ? noop() : applyEsLintFix() : noop()
  ]);
}
