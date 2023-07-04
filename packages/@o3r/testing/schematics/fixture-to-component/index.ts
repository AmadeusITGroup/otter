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
import {
  applyEsLintFix,
  getO3rComponentInfo} from '@o3r/schematics';
import { insertImport } from '@schematics/angular/utility/ast-utils';
import { applyToUpdateRecorder, Change, InsertChange } from '@schematics/angular/utility/change';
import { basename, dirname, resolve } from 'node:path';
import * as ts from 'typescript';
import type { NgAddFixtureSchematicsSchema } from './schema';

const checkFixture = (componentPath: string, tree: Tree, baseFileName: string) => {
  const files = [
    resolve(dirname(componentPath), `./${baseFileName}.fixture.ts`)
  ];
  if (files.some((file) => tree.exists(file))) {
    throw new Error(`Unable to add fixture to this component because it already has at least one of these files: ${files.join(', ')}.`);
  }
};

/**
 * Add fixture to an existing component
 *
 * @param options
 */
export function ngAddFixture(options: NgAddFixtureSchematicsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const baseFileName = basename(options.path, '.component.ts');
    const { name } = getO3rComponentInfo(tree, options.path);

    checkFixture(options.path, tree, baseFileName);

    const properties = {
      ...options,
      componentFixture: name.concat('Fixture'),
      name: baseFileName
    };

    const createFixtureFilesRule: Rule = mergeWith(apply(url('./templates'), [
      template(properties),
      renameTemplateFiles(),
      move(dirname(options.path))
    ]), MergeStrategy.Overwrite);

    const updateSpecRule: Rule = () => {
      const specFilePath = options.specFilePath || resolve(dirname(options.path), `./${baseFileName}.spec.ts`);
      if (!tree.exists(specFilePath)) {
        context.logger.warn(`No update applied on spec file because ${specFilePath} does not exist.`);
        return;
      }

      const specSourceFile = ts.createSourceFile(
        specFilePath,
        tree.readText(specFilePath),
        ts.ScriptTarget.ES2020,
        true
      );
      const imports = [
        {
          from: '@o3r/testing/core',
          importNames: ['O3rElement']
        },
        {
          from: `./${baseFileName}.fixture`,
          importNames: [properties.componentFixture]
        }
      ];
      const changes = imports.reduce((acc: Change[], { importNames, from }) => acc.concat(
        importNames.map((importName) =>
          insertImport(specSourceFile, specFilePath, importName, from)
        )
      ), []);

      const recorder = tree.beginUpdate(specFilePath);

      const lastImport = [...specSourceFile.statements].reverse().find((statement) =>
        ts.isImportDeclaration(statement)
      );

      changes.push(
        new InsertChange(
          specFilePath,
          lastImport?.getEnd() || 0,
          `\nlet componentFixture: ${properties.componentFixture}Component;`
        )
      );

      applyToUpdateRecorder(recorder, changes);
      tree.commitUpdate(recorder);

      const newContent = tree.readText(specFilePath)
        .replaceAll(
          /(component = fixture.componentInstance;)/g,
          `$1\ncomponentFixture = new ${properties.componentFixture}Component(new O3rElement(fixture.debugElement));`
        )
        .replaceAll(
          /(expect\(component\).toBeDefined\(\);)/g,
          '$1\nexpect(componentFixture).toBeDefined();'
        );

      tree.overwrite(specFilePath, newContent);

      return tree;
    };

    return chain([
      createFixtureFilesRule,
      updateSpecRule,
      options.skipLinter ? noop() : applyEsLintFix()
    ])(tree, context);
  };
}
