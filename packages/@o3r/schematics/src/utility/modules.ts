import { SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { getRouterModuleDeclaration } from '@schematics/angular/utility/ast-utils';
import * as fs from 'node:fs';
import { sync as globbySync } from 'globby';
import * as path from 'node:path';
import { getExportedSymbolsFromFile } from './ast';
import { getProjectFromTree } from './loaders';

/**
 * Get the path to the app.module.ts
 *
 * @param tree File tree
 * @param context Context of the rule
 */
export function getAppModuleFilePath(tree: Tree, context: SchematicContext) {
  const workspaceProject = getProjectFromTree(tree);
  // exit if not an application
  if (workspaceProject.projectType !== 'application') {
    context.logger.debug('Register localization on main module only in application project');
    return undefined;
  }

  const mainFilePath: string = workspaceProject.architect!.build.options.main;
  const mainFile = tree.read(mainFilePath)!.toString();

  const bootstrapModuleRegexpResult = mainFile.match(/bootstrapModule\(([^)]*)\)/m);
  if (!bootstrapModuleRegexpResult || !bootstrapModuleRegexpResult[1]) {
    throw new SchematicsException('Could not find bootstrap module');
  }

  const bootstrapModule = bootstrapModuleRegexpResult[1];
  const findSource = new RegExp(`import +\\{[^}]*${bootstrapModule}[^}]*\\} +from +['"]([^'"]+)['"] *;`, 'm');

  const bootstrapModuleFileRegExpResult = mainFile.match(findSource);
  if (!bootstrapModuleFileRegExpResult || !bootstrapModuleFileRegExpResult[1]) {
    throw new SchematicsException('Could not find bootstrap module');
  }

  /** Path to the main module file */
  const moduleFilePath = path.join(path.dirname(workspaceProject.architect!.build.options.main), bootstrapModuleFileRegExpResult[1] + '.ts');

  const exportAppModuleClassRegExp = new RegExp(`class\\s+${bootstrapModule}`, 'gm');

  if (tree.exists(moduleFilePath) && tree.read(moduleFilePath)!.toString().match(exportAppModuleClassRegExp)) {
    return moduleFilePath;
  }

  const possibleAppModule = path.join(path.dirname(workspaceProject.architect!.build.options.main), path.dirname(bootstrapModuleFileRegExpResult[1]), 'app.module.ts');
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
    const relativeFilePath = filePath ? path.relative(path.dirname(workspaceProject.architect!.build.options.main), `${filePath}.ts`) : undefined;
    const filePathInTree = relativeFilePath ? path.join(path.dirname(workspaceProject.architect!.build.options.main), relativeFilePath) : undefined;
    if (filePathInTree && tree.exists(filePathInTree) && tree.read(filePathInTree)!.toString().match(exportAppModuleClassRegExp)) {
      return filePathInTree;
    }
  }
  throw new SchematicsException(`Could not find ${bootstrapModule} source file`);

}

/**
 * Get the path to the main.ts
 *
 * @param tree File tree
 * @param context Context of the rule
 */
export function getMainFilePath(tree: Tree, context: SchematicContext) {
  const workspaceProject = getProjectFromTree(tree);
  // exit if not an application
  if (workspaceProject.projectType !== 'application') {
    context.logger.debug('Register localization on main module only in application project');
    return undefined;
  }

  const mainFilePath: string = workspaceProject.architect!.build.options.main;
  return mainFilePath;
}

/**
 * Returns true if the project is an application and contains a TS file that imports the angular RouterModule in
 * one of its modules.
 *
 * @param tree
 */
export function isApplicationThatUsesRouterModule(tree: Tree) {
  const workspaceProject = getProjectFromTree(tree);
  return workspaceProject.projectType === 'application' && workspaceProject.sourceRoot &&
    globbySync(path.join(workspaceProject.sourceRoot, '**', '*.ts')).some((filePath) => {
      const sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath).toString(), ts.ScriptTarget.ES2015, true);
      try {
        return !!getRouterModuleDeclaration(sourceFile);
      } catch {}
      return false;
    });
}
