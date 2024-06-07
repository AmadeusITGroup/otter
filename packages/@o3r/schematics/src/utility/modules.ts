import {SchematicContext, SchematicsException, Tree, UpdateRecorder} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import {
  addImportToModule,
  addProviderToModule,
  getRouterModuleDeclaration,
  insertImport, isImported
} from '@schematics/angular/utility/ast-utils';
import {InsertChange} from '@schematics/angular/utility/change';
import * as fs from 'node:fs';
import {sync as globbySync} from 'globby';
import * as path from 'node:path';
import {getExportedSymbolsFromFile} from './ast';
import { getWorkspaceConfig } from './loaders';


/**
 * Get the path to the `app.module.ts`
 * In case of standalone application, get the path to the `app.config.ts` instead
 * @param tree File tree
 * @param context Context of the rule
 * @param projectName The name of the project where to search for an app module file
 */
export function getAppModuleFilePath(tree: Tree, context: SchematicContext, projectName?: string | null) {
  const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
  // exit if not an application
  if (!workspaceProject) {
    context.logger.debug('Aborted. App module file path will be searched only in application project.');
    return undefined;
  }

  const mainFilePath: string = workspaceProject.architect!.build.options.main ?? workspaceProject.architect!.build.options.browser;
  const mainFile = tree.read(mainFilePath)!.toString();

  const bootstrapModuleRegexpResult = mainFile.match(/(?:bootstrapModule|bootstrapApplication)\((?:[^,)]*,)*\s*([^,) ]*)\s*\)/m);
  if (!bootstrapModuleRegexpResult || !bootstrapModuleRegexpResult[1]) {
    throw new SchematicsException('Could not find bootstrap module or appConfig');
  }

  const bootstrapModule = bootstrapModuleRegexpResult[1];
  const findSource = new RegExp(`import +\\{[^}]*${bootstrapModule}[^}]*\\} +from +['"]([^'"]+)['"] *;`, 'm');

  const bootstrapModuleFileRegExpResult = mainFile.match(findSource);
  if (!bootstrapModuleFileRegExpResult || !bootstrapModuleFileRegExpResult[1]) {
    throw new SchematicsException('Could not find bootstrap module or appConfig');
  }

  /** Path to the main module file */
  const moduleFilePath = path.join(path.dirname(mainFilePath), bootstrapModuleFileRegExpResult[1] + '.ts');

  const exportAppModuleClassRegExp = new RegExp(`(?:class|const)\\s+${bootstrapModule}`, 'gm');

  if (tree.exists(moduleFilePath) && tree.read(moduleFilePath)!.toString().match(exportAppModuleClassRegExp)) {
    return moduleFilePath;
  }

  const possibleAppModule = path.join(path.dirname(mainFilePath), path.dirname(bootstrapModuleFileRegExpResult[1]), 'app.module.ts');
  if (tree.exists(possibleAppModule) && tree.read(possibleAppModule)!.toString().match(exportAppModuleClassRegExp)) {
    return possibleAppModule;
  }

  // search app module source file in tree
  const normalizedFilePath = moduleFilePath.split(path.sep).join(path.posix.sep);
  const prog = ts.createProgram([normalizedFilePath], {});

  const symbols = getExportedSymbolsFromFile(prog, normalizedFilePath);

  const bootstrapModuleSymbol = symbols.find(s => s.name === bootstrapModule);
  const checker = prog.getTypeChecker();

  if (bootstrapModuleSymbol) {
    const pathPlusModuleString = checker.getFullyQualifiedName(bootstrapModuleSymbol);
    const filePath = pathPlusModuleString?.replace(new RegExp(`.${bootstrapModule}`), '').replace(/['"]/g, '');
    const relativeFilePath = filePath ? path.relative(path.dirname(mainFilePath), `${filePath}.ts`) : undefined;
    const filePathInTree = relativeFilePath ? path.join(path.dirname(mainFilePath), relativeFilePath) : undefined;
    if (filePathInTree && tree.exists(filePathInTree) && tree.read(filePathInTree)!.toString().match(exportAppModuleClassRegExp)) {
      return filePathInTree;
    }
  }
  throw new SchematicsException(`Could not find ${bootstrapModule} source file`);

}

/**
 * Get the path to the main.ts
 * @param tree File tree
 * @param context Context of the rule
 * @param projectName
 */
export function getMainFilePath(tree: Tree, context: SchematicContext, projectName?: string) {
  const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
  // exit if not an application
  if (!workspaceProject) {
    context.logger.debug('Register localization on main module only in application project');
    return undefined;
  }

  const mainFilePath: string = workspaceProject.architect!.build.options.main ?? workspaceProject.architect!.build.options.browser;
  return mainFilePath;
}

/**
 * Returns true if the project is an application and contains a TS file that imports the angular RouterModule in
 * one of its modules.
 * @param tree
 * @param options @see RuleFactory.options
 * @param options.projectName
 */
export function isApplicationThatUsesRouterModule(tree: Tree, options: { projectName?: string | undefined }) {
  const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
  const cwd = process.cwd().replace(/[\\/]+/g, '/');
  const root = (workspaceProject?.root && cwd.endsWith(workspaceProject.root)) ? workspaceProject.root.replace(/[^\\/]+/g, '..') : '.';
  return workspaceProject?.sourceRoot &&
    globbySync(path.posix.join(root, workspaceProject.sourceRoot, '**', '*.ts')).some((filePath) => {
      const fileContent = fs.readFileSync(filePath).toString();
      if (!/RouterModule/.test(fileContent)) {
        return false;
      }
      const sourceFile = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.ES2015, true);
      try {
        return !!getRouterModuleDeclaration(sourceFile);
      } catch {}
      return false;
    });
}

/**
 * Add import to the main module
 * @param name
 * @param file
 * @param sourceFile
 * @param sourceFileContent
 * @param context
 * @param moduleFilePath
 * @param moduleIndex
 * @param recorder
 * @param moduleFunction
 * @param override
 */
export function addImportToModuleFile(name: string, file: string, sourceFile: ts.SourceFile, sourceFileContent: string, context: SchematicContext, recorder: UpdateRecorder,
                                      moduleFilePath: string, moduleIndex: number, moduleFunction?: string, override = false) {
  const importMatch = sourceFileContent.slice(moduleIndex).match(new RegExp(`(${name})(\\.[a-zA-Z\\s\\n]+\\()?(,\\n?)?`));
  if (!!importMatch && !override) {
    context.logger.warn(`Skipped ${name} (already imported)`);
    return recorder;
  } else if (importMatch?.[2]) {
    context.logger.warn(`Skipped ${name}${moduleFunction || ''} (already imported with method). Cannot override automatically`);
    return recorder;
  } else if (override && isImported(sourceFile, name, file) && !!importMatch && !Number.isNaN(importMatch.index)) {
    recorder = recorder.remove(moduleIndex + importMatch.index!, importMatch[0].length);
    recorder = recorder.insertLeft(moduleIndex + importMatch.index!, moduleIndex + importMatch.index! > moduleIndex ? name + moduleFunction! + (importMatch[3] || '') : name);
  } else {
    addImportToModule(sourceFile, moduleFilePath, name, file)
      .forEach((change) => {
        if (change instanceof InsertChange) {
          recorder = recorder.insertLeft(change.pos, moduleFunction && change.pos > moduleIndex ? change.toAdd.replace(name, name + moduleFunction) : change.toAdd);
        }
      });
  }
  return recorder;
}

/**
 * Insert import on top of the main module file
 * @param name
 * @param file
 * @param sourceFile
 * @param recorder
 * @param moduleFilePath
 * @param isDefault
 */
export function insertImportToModuleFile(name: string, file: string, sourceFile: ts.SourceFile, recorder: UpdateRecorder, moduleFilePath: string, isDefault?: boolean) {
  const importChange = insertImport(sourceFile, moduleFilePath, name, file, isDefault);
  if (importChange instanceof InsertChange) {
    return recorder.insertLeft(importChange.pos, importChange.toAdd);
  }
  return recorder;
}


/**
 * Add providers to the main module
 * @param name
 * @param file
 * @param sourceFile
 * @param sourceFileContent
 * @param context
 * @param recorder
 * @param moduleFilePath
 * @param moduleIndex
 * @param customProvider
 */
export function addProviderToModuleFile(name: string, file: string, sourceFile: ts.SourceFile, sourceFileContent: string, context: SchematicContext, recorder: UpdateRecorder,
                                        moduleFilePath: string, moduleIndex: number, customProvider?: string) {
  if (new RegExp(name).test(sourceFileContent.substr(moduleIndex))) {
    context.logger.warn(`Skipped ${name} (already provided)`);
    return recorder;
  }
  addProviderToModule(sourceFile, moduleFilePath, name, file)
    .forEach((change) => {
      if (change instanceof InsertChange) {
        recorder = recorder.insertLeft(change.pos, customProvider && change.pos > moduleIndex ? change.toAdd.replace(name, customProvider) : change.toAdd);
      }
    });
  return recorder;
}

/**
 * Add custom code before the module definition
 * @param line
 * @param file
 * @param recorder
 * @param moduleIndex
 */
export function insertBeforeModule(line: string, file: string, recorder: UpdateRecorder, moduleIndex: number) {
  if (file.indexOf(line.replace(/[\r\n ]*/g, '')) === -1) {
    return recorder.insertLeft(moduleIndex - 1, `${line}\n\n`);
  }
  return recorder;
}
