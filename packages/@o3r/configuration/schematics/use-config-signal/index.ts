import {
  chain,
  noop,
  type Rule,
  type Tree,
} from '@angular-devkit/schematics';
import {
  addCommentsOnClassProperties,
  addImportsRule,
  addInterfaceToClassTransformerFactory,
  applyEsLintFix,
  createOtterSchematic,
  generateClassElementsFromString,
  isO3rClassComponent,
  O3rCliError,
} from '@o3r/schematics';
import * as ts from 'typescript';
import type {
  NgUseConfigSignalSchematicsSchema,
} from './schema';

const configObserverRegexp = /.*new ConfigurationObserver<(?<configName>\w+)>\(\s*(?<configId>\w+),\s*(?<defaultConfig>\w+)(,\s*\w+)?\s*\);/;

function ngUseConfigSignalFn(options: NgUseConfigSignalSchematicsSchema): Rule {
  return chain([
    addImportsRule(options.path, [
      {
        from: '@angular/core',
        importNames: [
          'inject',
          'input'
        ]
      },
      {
        from: '@angular/core/rxjs-interop',
        importNames: [
          'toObservable'
        ]
      },
      {
        from: '@o3r/configuration',
        importNames: [
          'configSignal',
          'O3rConfig',
          'DynamicConfigurableWithSignal'
        ]
      }
    ]),
    (tree: Tree) => {
      const content = tree.readText(options.path);
      // Retrieve all info
      const match = content.match(configObserverRegexp);
      const {
        configName,
        configId,
        defaultConfig
      } = match?.groups || {};
      if (!configName || !configId || !defaultConfig) {
        throw new O3rCliError(`Configuration name, id or default value not found in ${options.path}.\nCannot migrate to signal based configuration.`);
      }

      const componentSourceFile = ts.createSourceFile(
        options.path,
        content,
        ts.ScriptTarget.ES2020,
        true
      );

      const result = ts.transform(componentSourceFile, [
        addInterfaceToClassTransformerFactory(
          `DynamicConfigurableWithSignal<${configName}>`,
          isO3rClassComponent,
          new Set(['DynamicConfigurable'])
        ),
        (ctx) => (rootNode: ts.Node) => {
          const { factory } = ctx;
          const visit = (node: ts.Node): ts.Node => {
            if (ts.isClassDeclaration(node) && isO3rClassComponent(node)) {
              const propertiesToAdd = generateClassElementsFromString(`
  public config = input<Partial<${configName}>>();

  @O3rConfig()
  public readonly configSignal = configSignal(this.config, ${configId}, ${defaultConfig});

  public readonly config$ = toObservable(this.configSignal);`);

              const newMembers = propertiesToAdd.concat(
                node.members.filter((member) =>
                  !member.name
                  || (
                    ts.isIdentifier(member.name)
                    && ![
                      'config$',
                      'config',
                      'dynamicConfig$'
                    ].includes(member.name.escapedText.toString())
                  )
                )
              );

              addCommentsOnClassProperties(
                newMembers,
                {
                  config: 'Input configuration to override the default configuration of the component',
                  configSignal: 'Configuration signal based on the input and the stored configuration',
                  config$: '@deprecated use configSignal instead'
                }
              );

              return factory.updateClassDeclaration(
                node,
                ts.getModifiers(node),
                node.name,
                node.typeParameters,
                node.heritageClauses,
                newMembers
              );
            }
            return ts.visitEachChild(node, visit, ctx);
          };
          return ts.visitNode(rootNode, visit);
        }
      ]);

      const printer = ts.createPrinter({
        removeComments: false,
        newLine: ts.NewLineKind.LineFeed
      });

      let newContent = printer.printFile(result.transformed[0] as any as ts.SourceFile);

      newContent = newContent
        .replace(
          /this\.dynamicConfig\$\.next\(this.config\);/,
          '// TODO remove the ngOnChanges if empty'
        )
        .replace(configObserverRegexp, '')
        .replace(/this\.config\$\s*=\s*this\.dynamicConfig\$\s*\.asObservable\(\);/, '');

      tree.overwrite(options.path, newContent);
      return tree;
    },
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}

/**
 * Migrate from configuration observable to signal
 * @param options
 */
export const ngUseConfigSignal = createOtterSchematic(ngUseConfigSignalFn);
