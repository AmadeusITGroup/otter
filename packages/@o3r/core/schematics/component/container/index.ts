import { apply, chain, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  getComponentBlockName,
  getComponentContextName,
  getComponentFileName,
  getComponentFixtureName,
  getComponentFolderName,
  getComponentModuleName,
  getComponentName,
  getComponentSelectorWithoutSuffix, getDestinationPath, getInputComponentName,
  getKebabCaseBlockName, getProjectFromTree
} from '@o3r/schematics';
import * as path from 'node:path';
import { getAddConfigurationRules } from '../common/configuration';
import { ComponentStructureDef } from '../structures.types';
import { NgGenerateComponentContainerSchematicsSchema } from './schema';
import { getAddFixtureRules } from '../common/fixture';

export const CONTAINER_FOLDER = 'container';
const MODULE_TEMPLATE_PATH = './templates/module';
const CONTAINER_TEMPLATE_PATH = './templates/container';
const CONTEXT_TEMPLATE_PATH = './templates/context';

/**
 * Generates the template properties
 *
 * @param options
 * @param componentStructureDef
 * @param prefix
 */
const getTemplateProperties = (options: NgGenerateComponentContainerSchematicsSchema, componentStructureDef: ComponentStructureDef, prefix?: string) => {

  const inputComponentName = getInputComponentName(options.componentName);
  const blockName = getComponentBlockName(inputComponentName);
  const folderName = getComponentFolderName(inputComponentName);

  return {
    ...options,
    componentType: options.componentStructure === 'full' ? 'Block' : 'Component',
    moduleName: getComponentModuleName(inputComponentName, componentStructureDef),
    componentName: getComponentName(inputComponentName, componentStructureDef),
    blockName,
    kebabCaseBlockName: getKebabCaseBlockName(blockName),
    componentContext: getComponentContextName(inputComponentName, componentStructureDef),
    componentFixture: getComponentFixtureName(inputComponentName, componentStructureDef),
    componentSelector: getComponentSelectorWithoutSuffix(options.componentName, prefix || null),
    folderName,
    name: getComponentFileName(options.componentName, componentStructureDef), // air-offer | air-offer-cont,
    suffix: componentStructureDef.toLowerCase(), // cont | ''
    description: options.description || ''
  };
};

/**
 * Add Otter container component to an Angular Project
 *
 * @param options
 */
export function ngGenerateComponentContainer(options: NgGenerateComponentContainerSchematicsSchema): Rule {

  const fullStructureRequested = options.componentStructure === 'full';

  const generateFiles = async (tree: Tree, context: SchematicContext) => {

    const workspaceProject = getProjectFromTree(tree);

    const properties = getTemplateProperties(options, ComponentStructureDef.Cont, options.prefix ? options.prefix : workspaceProject?.prefix);

    const destination = getDestinationPath('@o3r/core:component', options.path, tree);
    const componentDestination = path.join(destination, fullStructureRequested ? path.join(properties.folderName, CONTAINER_FOLDER) : properties.folderName);

    const rules: Rule[] = [];

    rules.push(mergeWith(apply(url(CONTAINER_TEMPLATE_PATH), [
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

    if (options.useContext) {
      rules.push(mergeWith(apply(url(CONTEXT_TEMPLATE_PATH), [
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

    const fixtureRules = await getAddFixtureRules(
      path.join(componentDestination, componentPath),
      options,
      context
    );
    rules.push(...fixtureRules);

    return chain(rules);
  };

  return chain([
    generateFiles,
    !fullStructureRequested ? options.skipLinter ? noop() : applyEsLintFix() : noop()
  ]);
}
