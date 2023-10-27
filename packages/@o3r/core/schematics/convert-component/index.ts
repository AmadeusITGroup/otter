import { chain, noop, Rule, Tree } from '@angular-devkit/schematics';
import { applyEsLintFix, isNgClassComponent, isO3rClassComponent, O3rCliError } from '@o3r/schematics';
import { insertImport } from '@schematics/angular/utility/ast-utils';
import { applyToUpdateRecorder, InsertChange } from '@schematics/angular/utility/change';
import * as ts from 'typescript';
import { ConvertToO3rComponentSchematicsSchema } from './schema';


/**
 * Convert an Angular component into an Otter component
 *
 * @param options
 */
export function convertToO3rComponent(options: ConvertToO3rComponentSchematicsSchema): Rule {

  const updateComponentFile: Rule = (tree: Tree) => {
    const sourceFile = ts.createSourceFile(
      options.path,
      tree.readText(options.path),
      ts.ScriptTarget.ES2020,
      true
    );

    const recorder = tree.beginUpdate(options.path);
    const changes = [];

    changes.push(insertImport(sourceFile, options.path, 'O3rComponent', '@o3r/core'));

    const ngComponentDeclaration = sourceFile.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && isNgClassComponent(s));

    if (!ngComponentDeclaration) {
      throw new O3rCliError(`No Angular component found in ${options.path}.`);
    }

    if (isO3rClassComponent(ngComponentDeclaration)) {
      throw new O3rCliError(`${ngComponentDeclaration.name?.escapedText.toString() || 'It'} is already an Otter component.`);
    }

    changes.push(
      new InsertChange(
        options.path,
        ngComponentDeclaration.getStart(),
        `@O3rComponent({ componentType: '${options.componentType}' })\n`
      )
    );

    applyToUpdateRecorder(recorder, changes);
    tree.commitUpdate(recorder);
    return tree;
  };

  return chain([
    updateComponentFile,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}
