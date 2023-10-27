import { chain, Rule } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { getDecoratorMetadata, isImported } from '@schematics/angular/utility/ast-utils';
import { getAppModuleFilePath, getDefaultOptionsForSchematic, getWorkspaceConfig } from '../../utility';
import type { WorkspaceSchematics } from '../../interfaces';
import { addImportToModuleFile as o3rAddImportToModuleFile } from '../../utility';

/** Options for the devtools register rule factory */
export interface DevtoolRegisterOptions {
  /** Name of the devtool module */
  moduleName: string;
  /** Package name from which the devtools is exposed */
  packageName: string;
  /** Name of the workspace project name */
  projectName?: string;
  /** Name of the devtools service (if available) */
  serviceName?: string;
}

const registerModule = (options: DevtoolRegisterOptions): Rule => (tree, context) => {
  const moduleFilePath = getAppModuleFilePath(tree, context, options.projectName);
  if (!moduleFilePath) {
    return tree;
  }

  const sourceFileContent = tree.read(moduleFilePath)!.toString();
  const sourceFile = ts.createSourceFile(
    moduleFilePath,
    sourceFileContent,
    ts.ScriptTarget.ES2015,
    true
  );

  if (isImported(sourceFile, options.moduleName, options.packageName)) {
    return tree;
  }

  let recorder = tree.beginUpdate(moduleFilePath);
  const ngModulesMetadata = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');
  const moduleIndex = ngModulesMetadata[0] ? ngModulesMetadata[0].pos - ('NgModule'.length + 1) : sourceFileContent.indexOf('@NgModule');

  const addImportToModuleFile = (name: string, file: string, moduleFunction?: string) =>
    recorder = o3rAddImportToModuleFile(name, file, sourceFile, sourceFileContent, context, recorder, moduleFilePath, moduleIndex, moduleFunction);

  addImportToModuleFile(
    options.moduleName,
    options.packageName,
    '.instrument({isActivatedOnBootstrap: true})'
  );

  tree.commitUpdate(recorder);
  return tree;
};

/**
 * Register Devtools to the application
 * @param tree
 * @param context
 * @param options
 */
export const registerDevtoolsToApplication = (options: DevtoolRegisterOptions): Rule => (tree, context) => {
  const workspace = getWorkspaceConfig(tree);
  const project = options.projectName ? workspace?.projects[options.projectName] : undefined;

  if (!workspace || !project || project.projectType !== 'application') {
    context.logger.warn(`Failed to determine the application to update, the devtool modules ${options.moduleName}.`);
    return tree;
  }

  const schematicConfig = getDefaultOptionsForSchematic<WorkspaceSchematics['*:ng-add']>(workspace, options.packageName, 'ng-add', options);

  if (!schematicConfig?.registerDevtool) {
    return tree;
  }

  return chain([
    registerModule(options),
    (_, ctx) => ctx.logger.info(
      `The devtools module ${options.moduleName} has been registered and automatically activated${options.serviceName ? ', its activation can be driven via ' + options.serviceName : ''}.`
    )
  ])(tree, context);
};
