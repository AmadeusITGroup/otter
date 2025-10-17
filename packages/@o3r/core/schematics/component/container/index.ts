import * as path from 'node:path';
import {
  apply,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  schematic,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  addImportsAndCodeBlockStatementAtSpecInitializationTransformerFactory,
  addImportsIntoComponentDecoratorTransformerFactory,
  addImportsRule,
  applyEsLintFix,
  createOtterSchematic,
  getComponentFileName,
  getComponentFolderName,
  getComponentModuleName,
  getComponentName,
  getComponentSelectorWithoutSuffix,
  getDestinationPath,
  getInputComponentName,
  getWorkspaceConfig,
} from '@o3r/schematics';
import {
  addImportToModule,
  insertImport,
} from '@schematics/angular/utility/ast-utils';
import {
  applyToUpdateRecorder,
  InsertChange,
} from '@schematics/angular/utility/change';
import * as ts from 'typescript';
import {
  getAddConfigurationRules,
} from '../../rule-factories/component/configuration';
import {
  getAddContextRules,
} from '../../rule-factories/component/context';
import {
  getAddFixtureRules,
} from '../../rule-factories/component/fixture';
import {
  getAddRulesEngineRules,
} from '../../rule-factories/component/rules-engine';
import {
  PRESENTER_FOLDER,
} from '../presenter';
import {
  ComponentStructureDef,
} from '../structures.types';
import {
  NgGenerateComponentContainerSchematicsSchema,
} from './schema';

export const CONTAINER_FOLDER = 'container';

/**
 * Generates the template properties
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
 * @param options
 */
function ngGenerateComponentContainerFn(options: NgGenerateComponentContainerSchematicsSchema): Rule {
  const fullStructureRequested = options.componentStructure === 'full';

  const generateFiles = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    const properties = getTemplateProperties(options, ComponentStructureDef.Cont, options.prefix || workspaceProject?.prefix);

    const destination = getDestinationPath('@o3r/core:component', options.path, tree, options.projectName);
    const componentDestination = path.posix.join(destination, fullStructureRequested ? path.posix.join(properties.folderName, CONTAINER_FOLDER) : properties.folderName);
    const componentPath = path.posix.join(componentDestination, `${properties.name}.ts`);
    const specPath = path.posix.join(componentDestination, `${properties.name}.spec.ts`);
    const templatePath = path.posix.join(componentDestination, `${properties.name}.html`);

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
        skipSelector: false,
        skipTests: false,
        standalone: options.standalone,
        ...(
          options.standalone
            ? {
              skipImport: true
            }
            : {
              module: `${properties.name}-module.ts`,
              export: true
            }
        ),
        flat: true
      }),
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
          const modulePath = path.posix.join(componentDestination, `${properties.name}-module.ts`);
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
        if (!tree.exists(specPath)) {
          context.logger.warn(`No update applied on spec file because ${specPath} does not exist.`);
          return;
        }

        let specSourceFile = ts.createSourceFile(
          specPath,
          tree.readText(specPath),
          ts.ScriptTarget.ES2020,
          true
        );

        const recorder = tree.beginUpdate(specPath);

        const lastImport = [...specSourceFile.statements].reverse().find((statement) =>
          ts.isImportDeclaration(statement)
        );

        const changes = [
          insertImport(specSourceFile, specPath, 'Component', '@angular/core'),
          new InsertChange(specPath, lastImport?.getEnd() || 0, `
@Component({
  template: '',
  selector: '${properties.presenterComponentSelector}'
})
class Mock${properties.presenterComponentName} {}
        `)];

        applyToUpdateRecorder(recorder, changes);
        tree.commitUpdate(recorder);

        specSourceFile = ts.createSourceFile(
          specPath,
          tree.readText(specPath),
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

        tree.overwrite(specPath, newContent);

        return tree;
      };

      rules.push(
        (t) => {
          t.overwrite(templatePath, `<${properties.presenterComponentSelector}></${properties.presenterComponentSelector}>`);
          return t;
        },
        addPresenterComponentOrModuleToImport,
        addMockPresenterComponentInSpecFile
      );
    }

    rules.push(
      getAddConfigurationRules(
        componentPath,
        options
      ),
      getAddFixtureRules(
        componentPath,
        options
      ),
      getAddContextRules(
        componentPath,
        options
      ),
      getAddRulesEngineRules(
        path.posix.join(componentDestination, `${properties.name}.ts`),
        options
      )
    );

    return chain(rules);
  };

  return chain([
    generateFiles,
    fullStructureRequested ? noop() : (options.skipLinter ? noop() : applyEsLintFix())
  ]);
}

/**
 * Add Otter container component to an Angular Project
 * @param options
 */
export const ngGenerateComponentContainer = createOtterSchematic(ngGenerateComponentContainerFn);
