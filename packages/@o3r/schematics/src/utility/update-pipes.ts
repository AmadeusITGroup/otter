import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { basename, dirname, join } from 'node:path';
import * as ts from 'typescript';
import { DecoratorWithArg, isDecoratorWithArg } from './ast';
import { getO3rComponentInfoOrThrowIfNotFound, isNgClassComponent, isNgClassDecorator } from './component';
import { findFilesInTree } from './loaders';

/** Dictionary of pipes to be updated */
export type PipeReplacementInfo = Record<string, { new: { name: string; import?: string }; import: string }>;

const applyChanges = (
  pipeReplacementInfo: PipeReplacementInfo,
  ngDecorator: DecoratorWithArg,
  matchers: RegExpMatchArray[],
  fileWithImports: string,
  templateFile: string,
  tree: Tree,
  context: SchematicContext
) => {
  if (ts.isObjectLiteralExpression(ngDecorator.expression.arguments[0])) {
    const importsProp = ngDecorator.expression.arguments[0].properties.find((prop): prop is ts.PropertyAssignment & { initializer: ts.ArrayLiteralExpression } =>
      ts.isPropertyAssignment(prop)
              && ts.isIdentifier(prop.name)
              && prop.name.text === 'imports'
              && ts.isArrayLiteralExpression(prop.initializer)
    );
    if (importsProp) {
      matchers.forEach((matcher) => {
        const pipeName = matcher[1];
        const importModuleRegexp = new RegExp(`\\b${pipeReplacementInfo[pipeName].import}\\b`, 'g');
        if (importsProp.initializer.elements.some((element) => importModuleRegexp.test(element.getText()))) {
          if (pipeReplacementInfo[pipeName].new.import) {
            tree.overwrite(
              fileWithImports,
              tree.readText(fileWithImports).replaceAll(importModuleRegexp, pipeReplacementInfo[pipeName].new.import!)
            );
          }
          tree.overwrite(
            templateFile,
            tree.readText(templateFile).replaceAll(new RegExp(`\\|\\s*${pipeName}`, 'g'), `| ${pipeReplacementInfo[pipeName].new.name}`)
          );
        } else {
          context.logger.warn(
            `Deprecated pipe ${pipeName} was found in ${templateFile} `
            + `but no associated import in ${fileWithImports}`
            + `to be able to migrate to the new pipe ${pipeReplacementInfo[pipeName].new.name}.`
          );
        }
      });
    }
  }
};

const isNgModuleDecorator = (decorator: ts.Decorator) =>
  ts.isCallExpression(decorator.expression)
  && decorator.expression.expression
  && ts.isIdentifier(decorator.expression.expression)
  && decorator.expression.expression.text === 'NgModule';

/**
 * Returns a rule tu update pipes
 * @param pipeReplacementInfo
 */
export const updatePipes = (pipeReplacementInfo: PipeReplacementInfo): Rule => (tree, context) => {
  const pipeRegex = new RegExp(`\\|\\s*(${Object.keys(pipeReplacementInfo).join('|')})`, 'g');
  const files = findFilesInTree(tree.root, (file) => file.endsWith('.html'));
  files.forEach((file) => {
    const matchers = Array.from(
      file.content.toString().matchAll(pipeRegex)
    ).filter((matcher) => !!pipeReplacementInfo[matcher[1]]);
    if (matchers.length) {
      const directory = dirname(file.path);
      const baseFileName = basename(file.path, '.template.html');
      const componentFile = join(directory, `${baseFileName}.component.ts`);
      const moduleFile = join(directory, `${baseFileName}.module.ts`);
      let standalone = false;
      if (tree.exists(componentFile)) {
        try {
          const info = getO3rComponentInfoOrThrowIfNotFound(tree, componentFile);
          standalone = info.standalone;
        } catch {}
      }
      if (standalone) {
        const componentSourceFile = ts.createSourceFile(
          componentFile,
          tree.readText(componentFile),
          ts.ScriptTarget.ES2020,
          true
        );
        const [ngClass] = componentSourceFile.statements.filter((statement): statement is ts.ClassDeclaration =>
          ts.isClassDeclaration(statement)
          && isNgClassComponent(statement)
        );
        const [ngDecorator] = ((ngClass && ts.getDecorators(ngClass)) || []).filter(isNgClassDecorator);
        if (ngDecorator) {
          applyChanges(pipeReplacementInfo, ngDecorator, matchers, componentFile, file.path, tree, context);
        }
      } else if (tree.exists(moduleFile)) {
        const moduleSourceFile = ts.createSourceFile(
          moduleFile,
          tree.readText(moduleFile),
          ts.ScriptTarget.ES2020,
          true
        );
        const ngModuleClass = moduleSourceFile.statements.find((statement): statement is ts.ClassDeclaration =>
          ts.isClassDeclaration(statement)
          && !!(ts.getDecorators(statement) || []).find(isNgModuleDecorator)
        );
        const ngDecorator = ((ngModuleClass && ts.getDecorators(ngModuleClass)) || []).find(isNgModuleDecorator);
        if (ngDecorator && isDecoratorWithArg(ngDecorator)) {
          applyChanges(pipeReplacementInfo, ngDecorator, matchers, moduleFile, file.path, tree, context);
        }
      }
    }
  });
};
