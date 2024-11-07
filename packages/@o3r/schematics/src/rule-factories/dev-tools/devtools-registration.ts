import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  insertImport,
  isImported,
} from '@schematics/angular/utility/ast-utils';
import {
  applyToUpdateRecorder,
  InsertChange,
} from '@schematics/angular/utility/change';
import * as ts from 'typescript';
import type {
  WorkspaceSchematics,
} from '../../interfaces';
import {
  addImportToModuleFile as o3rAddImportToModuleFile,
} from '../../utility';
import {
  getAppModuleFilePath,
  getDefaultOptionsForSchematic,
  getMainFilePath,
  getModuleIndex,
  getWorkspaceConfig,
} from '../../utility/index';

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
  const { moduleIndex } = getModuleIndex(sourceFile, sourceFileContent);

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
 * Rule to inject a service after `bootstrapModule` or `bootstrapApplication`
 * @param options
 */
export const injectServiceInMain = (options: DevtoolRegisterOptions): Rule => (tree, context) => {
  if (!options.serviceName) {
    return tree;
  }

  const mainFilePath = getMainFilePath(tree, context, options.projectName);

  if (!mainFilePath || !tree.exists(mainFilePath)) {
    return tree;
  }

  const content = tree.readText(mainFilePath);
  if (content.includes(`inject(${options.serviceName})`)) {
    return tree;
  }

  const match = /bootstrap(Module|Application)\([^)]*\)/.exec(content);
  if (!match) {
    return tree;
  }

  const sourceFile = ts.createSourceFile(
    mainFilePath,
    content,
    ts.ScriptTarget.ES2015,
    true
  );

  const recorder = tree.beginUpdate(mainFilePath);
  const changes = [];

  if (!isImported(sourceFile, options.serviceName, options.packageName)) {
    changes.push(insertImport(sourceFile, mainFilePath, options.serviceName, options.packageName));
  }
  if (!isImported(sourceFile, 'inject', '@angular/core')) {
    changes.push(insertImport(sourceFile, mainFilePath, 'inject', '@angular/core'));
  }
  if (!isImported(sourceFile, 'runInInjectionContext', '@angular/core')) {
    changes.push(insertImport(sourceFile, mainFilePath, 'runInInjectionContext', '@angular/core'));
  }

  changes.push(
    new InsertChange(
      mainFilePath,
      match.index + match[0].length,
      `\n  .then((m) => { runInInjectionContext(m.injector, () => { inject(${options.serviceName}); }); return m; })`
    )
  );

  applyToUpdateRecorder(recorder, changes);
  tree.commitUpdate(recorder);
  return tree;
};

/**
 * Register Devtools to the application
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
    injectServiceInMain(options),
    (_, ctx) => ctx.logger.info(
      `The devtools module ${options.moduleName} has been registered and automatically activated${options.serviceName ? ', its activation can be driven via ' + options.serviceName : ''}.`
    )
  ])(tree, context);
};
