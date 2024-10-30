import {
  chain,
  noop,
  Rule,
  Tree
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createSchematicWithMetricsIfInstalled,
  O3rCliError
} from '@o3r/schematics';
import * as ts from 'typescript';
import {
  getImplementation,
  getSignature
} from './helpers';
import {
  description
} from './models';
import {
  NgAddFunctionsToFixtureSchematicsSchema
} from './schema';

/**
 * Generate fixture
 * @param options options to generate a fixture
 */
function ngAddFunctionsToFixtureFn(options: NgAddFunctionsToFixtureSchematicsSchema): Rule {
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
            const methodSignatures = node.getChildren().filter((child) => ts.isMethodSignature(child));
            const lastMethodSignature = methodSignatures.at(-1);
            const posForSignature = lastMethodSignature ? lastMethodSignature.end + 1 : node.end - 1;
            recorder.insertLeft(posForSignature, codeForInterface);
          } else if (ts.isClassDeclaration(node)) {
            if (index === 0) {
              const propDeclarations = node.members.filter((child) => ts.isPropertyDeclaration(child));
              const lastPropDecl = propDeclarations.at(-1);
              const posForSelectorProp = lastPropDecl ? lastPropDecl.end + 1 : node.end - 1;
              recorder.insertLeft(posForSelectorProp, codeForSelectorProp);
            }
            const methodDeclarations = node.getChildren().filter((child) => ts.isMethodDeclaration(child));
            const lastMethodDecl = methodDeclarations.at(-1);
            const posForImplem = lastMethodDecl ? lastMethodDecl.end + 1 : node.end - 1;
            recorder.insertLeft(posForImplem, codeForImplem);
          }
        });

        tree.commitUpdate(recorder);
      });
    },

    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}

/**
 * Generate fixture
 * @param options options to generate a fixture
 */
export const ngAddFunctionsToFixture = createSchematicWithMetricsIfInstalled(ngAddFunctionsToFixtureFn);
