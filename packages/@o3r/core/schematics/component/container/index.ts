import { apply, chain, externalSchematic, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, schematic, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import {
  addImportsAndCodeBlockStatementAtSpecInitializationTransformerFactory,
  addImportsIntoComponentDecoratorTransformerFactory,
  addImportsRule,
  applyEsLintFix,
  getComponentFileName,
  getComponentFolderName,
  getComponentModuleName,
  getComponentName,
  getComponentSelectorWithoutSuffix,
  getDestinationPath,
  getInputComponentName,
  getProjectFromTree
} from '@o3r/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { applyToUpdateRecorder, InsertChange } from '@schematics/angular/utility/change';
import * as path from 'node:path';
import * as ts from 'typescript';
import { getAddConfigurationRules } from '../../rule-factories/component/configuration';
import { getAddRulesEngineRules } from '../../rule-factories/component/rules-engine';
import { getAddFixtureRules } from '../../rule-factories/component/fixture';
import { getAddContextRules } from '../../rule-factories/component/context';
import { PRESENTER_FOLDER } from '../presenter';
import { ComponentStructureDef } from '../structures.types';
import { NgGenerateComponentContainerSchematicsSchema } from './schema';

export const CONTAINER_FOLDER = 'container';

/**
 * Generates the template properties
 *
 * @param options
 * @param componentStructureDef
 * @param prefix
 */
const getTemplateProperties = (options: NgGenerateComponentContainerSchematicsSchema, componentStructureDef: ComponentStructureDef, prefix?: string) => {

  const inputComponentName = getInputComponentName(options.componentName);
  const folderName = getComponentFolderName(inputComponentName);
  const componentSelector = getComponentSelectorWithoutSuffix(options.componentName, prefix || null);

  return {
    ...options,
    componentType: options.componentStructure === 'full' ? 'Block' : 'Component',
    presenterModuleName: getComponentModuleName(inputComponentName, ComponentStructureDef.Pres),
    componentName: getComponentName(inputComponentName, componentStructureDef).replace(/Component$/, ''),
    presenterComponentName: getComponentName(inputComponentName, ComponentStructureDef.Pres),
    presenterComponentSelector: `${componentSelector}-${ComponentStructureDef.Pres.toLowerCase()}`,
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
    const componentDestination = path.posix.join(destination, fullStructureRequested ? path.posix.join(properties.folderName, CONTAINER_FOLDER) : properties.folderName);
    const componentPath = path.posix.join(componentDestination, `${properties.name}.component.ts`);
    const ngSpecPath = path.posix.join(componentDestination, `${properties.name}.component.spec.ts`);
    const o3rSpecPath = path.posix.join(componentDestination, `${properties.name}.spec.ts`);
    const ngTemplatePath = path.posix.join(componentDestination, `${properties.name}.component.html`);
    const o3rTemplatePath = path.posix.join(componentDestination, `${properties.name}.template.html`);

    const rules: Rule[] = [];

    if (!options.standalone) {
      rules.push(
        externalSchematic('@schematics/angular', 'module', {
          project: properties.projectName,
          path: componentDestination,
          flat: true,
          name: properties.componentName
        })
      );
    }

    rules.push(
      mergeWith(apply(url('./templates'), [
        template(properties),
        renameTemplateFiles(),
        move(componentDestination)
      ]), MergeStrategy.Overwrite),
      externalSchematic('@schematics/angular', 'component', {
        project: properties.projectName,
        selector: `${properties.componentSelector}-${properties.suffix}`,
        path: componentDestination,
        name: properties.componentName,
        inlineStyle: false,
        inlineTemplate: false,
        viewEncapsulation: 'None',
        changeDetection: 'OnPush',
        style: 'none',
        type: 'Component',
        skipSelector: false,
        skipTests: false,
        standalone: options.standalone,
        ...(
          options.standalone ? {
            skipImport: true
          } : {
            module: `${properties.name}.module.ts`,
            export: true
          }
        ),
        flat: true
      }),
      // Angular schematics generate spec file with this pattern: component-name.component.spec.ts
      move(ngSpecPath, o3rSpecPath),
      // Angular schematics generate template file with this pattern: component-name.component.html
      chain([
        move(ngTemplatePath, o3rTemplatePath),
        (t) => {
          t.overwrite(
            componentPath,
            t.readText(componentPath).replace(
              path.basename(ngTemplatePath),
              path.basename(o3rTemplatePath)
            )
          );
          return t;
        }
      ]),
      schematic('convert-component', {
        path: componentPath,
        skipLinter: options.skipLinter,
        componentType: properties.componentType
      })
    );

    if (fullStructureRequested) {
      const componentPresenterDestination = path.posix.join('..', PRESENTER_FOLDER, 'index');
      const addPresenterComponentOrModuleToImport: Rule = options.standalone
        ? chain([
          addImportsRule(componentPath, [
            {
              from: componentPresenterDestination,
              importNames: [properties.presenterComponentName]
            }
          ]),
          () => {
            const componentSourceFile = ts.createSourceFile(
              componentPath,
              tree.readText(componentPath),
              ts.ScriptTarget.ES2020,
              true
            );

            const result = ts.transform(componentSourceFile, [
              addImportsIntoComponentDecoratorTransformerFactory([properties.presenterComponentName])
            ]);

            const printer = ts.createPrinter({
              removeComments: false,
              newLine: ts.NewLineKind.LineFeed
            });

            tree.overwrite(componentPath, printer.printFile(result.transformed[0] as any as ts.SourceFile));
            return tree;
          }
        ])
        : () => {
          const modulePath = path.posix.join(componentDestination, `${properties.name}.module.ts`);
          const moduleSourceFile = ts.createSourceFile(
            modulePath,
            tree.readText(modulePath),
            ts.ScriptTarget.ES2020,
            true
          );
          const changes = addImportToModule(moduleSourceFile, modulePath, properties.presenterModuleName, componentPresenterDestination);
          const recorder = tree.beginUpdate(modulePath);
          applyToUpdateRecorder(recorder, changes);
          tree.commitUpdate(recorder);
          return tree;
        };

      const addMockPresenterComponentInSpecFile: Rule = () => {
        if (!tree.exists(o3rSpecPath)) {
          context.logger.warn(`No update applied on spec file because ${o3rSpecPath} does not exist.`);
          return;
        }

        let specSourceFile = ts.createSourceFile(
          o3rSpecPath,
          tree.readText(o3rSpecPath),
          ts.ScriptTarget.ES2020,
          true
        );

        const recorder = tree.beginUpdate(o3rSpecPath);

        const lastImport = [...specSourceFile.statements].reverse().find((statement) =>
          ts.isImportDeclaration(statement)
        );

        const changes = [new InsertChange(o3rSpecPath, lastImport?.getEnd() || 0, `
@Component({
  template: '',
  selector: '${properties.presenterComponentSelector}',
  standalone: true
})
class Mock${properties.presenterComponentName} {}
        `)];

        applyToUpdateRecorder(recorder, changes);
        tree.commitUpdate(recorder);

        specSourceFile = ts.createSourceFile(
          o3rSpecPath,
          tree.readText(o3rSpecPath),
          ts.ScriptTarget.ES2020,
          true
        );

        const result = ts.transform(specSourceFile, [
          addImportsAndCodeBlockStatementAtSpecInitializationTransformerFactory([
            `Mock${properties.presenterComponentName}`
          ])
        ]);

        const printer = ts.createPrinter({
          removeComments: false,
          newLine: ts.NewLineKind.LineFeed
        });

        const newContent = printer.printFile(result.transformed[0] as any as ts.SourceFile);

        tree.overwrite(o3rSpecPath, newContent);

        return tree;
      };

      rules.push(
        (t) => {
          t.overwrite(o3rTemplatePath, `<${properties.presenterComponentSelector}></${properties.presenterComponentSelector}>`);
          return t;
        },
        addPresenterComponentOrModuleToImport,
        addMockPresenterComponentInSpecFile
      );
    }

    const configurationRules = await getAddConfigurationRules(
      componentPath,
      options,
      context
    );
    rules.push(...configurationRules);

    const fixtureRules = await getAddFixtureRules(
      componentPath,
      options,
      context
    );
    rules.push(...fixtureRules);

    const contextRules = await getAddContextRules(
      componentPath,
      options,
      context
    );
    rules.push(...contextRules);

    const rulesEngineRules = await getAddRulesEngineRules(
      path.posix.join(componentDestination, `${properties.name}.component.ts`),
      options,
      context
    );
    rules.push(...rulesEngineRules);

    return chain(rules);
  };

  return chain([
    generateFiles,
    !fullStructureRequested ? options.skipLinter ? noop() : applyEsLintFix() : noop()
  ]);
}
