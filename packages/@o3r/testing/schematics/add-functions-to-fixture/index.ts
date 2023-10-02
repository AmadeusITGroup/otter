import { chain, noop, Rule, Tree } from '@angular-devkit/schematics';
import { eslintRule, O3rCliError } from '@o3r/schematics';
import * as ts from 'typescript';
import { getImplementation, getSignature } from './helpers';
import { description } from './models';
import { NgAddFunctionsToFixtureSchematicsSchema } from './schema';

/**
 * Generate fixture
 *
 * @param options options to generate a fixture
 */
export function ngAddFunctionsToFixture(options: NgAddFunctionsToFixtureSchematicsSchema): Rule {
  return chain([
    (tree: Tree) => {
      const { path, methods, selector } = options;
      if (!tree.exists(path)) {
        throw new O3rCliError(`File does not exist: ${path}`);
      }
      methods.forEach((methodType, index) => {
        const signature = getSignature(methodType, selector);

        const codeForInterface = `${description[methodType]}\n  ${signature};\n`;

        const classPropSelector = `SELECTOR_${selector.toUpperCase().replace(/\./g, '').replace(/-/g, '_')}`;

        const codeForSelectorProp = `  protected readonly ${classPropSelector} = '${selector}';\n`;

        const codeForImplem = `
  /** @inheritDoc */
  public async ${signature} ${getImplementation(methodType, classPropSelector)}\n`;

        const sourceFile = ts.createSourceFile(
          path,
          tree.read(path)!.toString(),
          ts.ScriptTarget.ES2015,
          true
        );
        const recorder = tree.beginUpdate(path);

        sourceFile.forEachChild((node) => {
          if (ts.isInterfaceDeclaration(node)) {
            const methodSignatures = node.getChildren().filter(ts.isMethodSignature);
            const lastMethodSignature = methodSignatures[methodSignatures.length - 1];
            const posForSignature = lastMethodSignature ? lastMethodSignature.end + 1 : node.end - 1;
            recorder.insertLeft(posForSignature, codeForInterface);
          } else if (ts.isClassDeclaration(node)) {
            if (index === 0) {
              const propDeclarations = node.members.filter(ts.isPropertyDeclaration);
              const lastPropDecl = propDeclarations[propDeclarations.length - 1];
              const posForSelectorProp = lastPropDecl ? lastPropDecl.end + 1 : node.end - 1;
              recorder.insertLeft(posForSelectorProp, codeForSelectorProp);
            }
            const methodDeclarations = node.getChildren().filter(ts.isMethodDeclaration);
            const lastMethodDecl = methodDeclarations[methodDeclarations.length - 1];
            const posForImplem = lastMethodDecl ? lastMethodDecl.end + 1 : node.end - 1;
            recorder.insertLeft(posForImplem, codeForImplem);
          }
        });

        tree.commitUpdate(recorder);
      });

    },
    options.skipLinter ? noop() : eslintRule
  ]);
}
