import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import {
  findFirstNodeOfKind, getAppModuleFilePath, getDefaultProjectName, getExternalDependenciesVersionRange, getNodeDependencyList,
  getProjectFromTree, getTemplateFolder, ignorePatterns, readAngularJson, readPackageJson, writeAngularJson
} from '@o3r/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import {
  addImportToModule,
  addProviderToModule,
  getDecoratorMetadata,
  insertImport,
  isImported
} from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as path from 'node:path';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
const ngxTranslateCoreDep = '@ngx-translate/core';
const intlMessageFormatDep = 'intl-messageformat';
const formatjsIntlNumberformatDep = '@formatjs/intl-numberformat';
const angularCdkDep = '@angular/cdk';

/**
 * Add Otter localization support
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateLocalization(options: { projectName: string | null }, rootPath: string): Rule {

  const mainAssetsFolder = 'src/assets';
  const devResourcesFolder = 'dev-resources';

  /**
   * Generate locales folder
   *
   * @param tree
   * @param context
   */
  const generateLocalesFolder = (tree: Tree, context: SchematicContext) => {

    let gitIgnoreContent = '';
    if (tree.exists('.gitignore')) {
      gitIgnoreContent = tree.read('.gitignore')!.toString();
      if (gitIgnoreContent.indexOf('/*.metadata.json')) {
        return tree;
      }
      tree.delete('.gitignore');
    }

    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        empty: '',
        devResourcesFolder,
        gitIgnoreContent,
        mainAssetsFolder
      })
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return rule(tree, context);
  };

  /**
   * Add translation generation builders into angular.json
   *
   * @param tree
   * @param context
   */
  const updateAngularJson: Rule = (tree: Tree, context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = options.projectName || workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree, projectName);
    const distFolder: string =
      (
        workspaceProject.architect &&
        workspaceProject.architect.build &&
        workspaceProject.architect.build.options &&
        (
          workspaceProject.architect.build.configurations && workspaceProject.architect.build.configurations.production && workspaceProject.architect.build.configurations.production.outputPath ||
          workspaceProject.architect.build.options.outputPath
        )
      ) || './dist';

    // exit if not an application
    if (workspaceProject.projectType !== 'application') {
      context.logger.debug('Add translation extraction only on application project');
      return tree;
    }

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    workspaceProject.architect['generate-translations'] ||= {
      builder: '@o3r/localization:localization',
      options: {
        browserTarget: `${projectName}:build`,
        localizationExtracterTarget: `${projectName}:extract-translations`,
        locales: [
          'en-GB'
        ],
        assets: [`${mainAssetsFolder}/locales`],
        outputPath: `${devResourcesFolder}/localizations`
      },
      configurations: {
        production: {
          outputPath: `${distFolder}/localizations`
        }
      }
    };

    if (workspaceProject.architect.build) {
      const alreadyExistingBuildOption =
        workspaceProject.architect.build.options?.assets?.map((a: { glob: string; input: string; output: string }) => a.output).find((output: string) => output === 'localizations');

      if (!alreadyExistingBuildOption) {
        workspaceProject.architect.build.options.assets.push({
          glob: '**/*.json',
          input: `${devResourcesFolder}/localizations`,
          output: '/localizations'
        });
      }
    }

    if (workspaceProject.architect.test) {
      const alreadyExistingTestOption =
        workspaceProject.architect.test.options?.assets?.map((a: { glob: string; input: string; output: string }) => a.output).find((output: string) => output === 'localizations');
      if (!alreadyExistingTestOption) {
        workspaceProject.architect.test.options.assets.push({
          glob: '**/*.json',
          input: `${devResourcesFolder}/localizations`,
          output: '/localizations'
        });
      }
    }

    const targets = [
      `${projectName}:generate-translations`,
      `${projectName}:serve`
    ];
    if (workspaceProject.architect.run && workspaceProject.architect.run.options && Array.isArray(workspaceProject.architect.run.options.targets)) {
      workspaceProject.architect.run.options.targets.push(...targets);
      workspaceProject.architect.run.options.targets = (workspaceProject.architect.run.options.targets as string[])
        .reduce<string[]>((acc, target) => acc.indexOf(target) > -1 ? acc : [...acc, target], []);
    } else {
      workspaceProject.architect.run = {
        builder: '@o3r/core:multi-watcher',
        options: {
          targets
        }
      };
    }

    workspace.projects[projectName] = workspaceProject;
    return writeAngularJson(tree, workspace);
  };

  /**
   * Changed package.json start script to run localization generation
   *
   * @param tree
   * @param context
   */
  const updatePackageJson: Rule = (tree: Tree, context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = options.projectName || workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree, projectName || undefined);
    const packageJson = readPackageJson(tree, workspaceProject);

    // exit if not an application
    if (workspaceProject.projectType !== 'application') {
      context.logger.debug('Add translation extraction scripts only on application project');
      return tree;
    }

    packageJson.scripts = packageJson.scripts || {};
    if (packageJson.scripts && packageJson.scripts.start && packageJson.scripts.start !== `ng run ${projectName}:run`) {
      packageJson.scripts['start:no-translation'] ||= packageJson.scripts.start;
    }
    if (packageJson.scripts.watch) {
      delete packageJson.scripts.watch;
    }
    packageJson.scripts.start ||= `ng run ${projectName}:run`;
    if (packageJson.scripts.build?.indexOf('generate:translations') === -1) {
      packageJson.scripts.build = `yarn generate:translations && ${packageJson.scripts.build}`;
    }
    packageJson.scripts['generate:translations:dev'] ||= `ng run ${projectName}:generate-translations`;
    packageJson.scripts['generate:translations'] ||= `ng run ${projectName}:generate-translations:production`;

    tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));
  };

  /**
   * Edit main module with the translation required configuration
   *
   * @param tree
   * @param context
   */
  const registerModules: Rule = (tree: Tree, context: SchematicContext) => {
    const moduleFilePath = getAppModuleFilePath(tree, context);
    if (!moduleFilePath) {
      return tree;
    }

    const sourceFile = ts.createSourceFile(
      moduleFilePath,
      tree.read(moduleFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    // avoid overriding app module if Localization module is already imported
    if (isImported(sourceFile, 'LocalizationModule', '@otter/common') || isImported(sourceFile, 'LocalizationModule', '@o3r/localization')) {
      return tree;
    }

    const recorder = tree.beginUpdate(moduleFilePath);
    const ngModulesMetadata = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');
    const appModuleFile = tree.read(moduleFilePath)!.toString();
    const moduleIndex = ngModulesMetadata[0] ? ngModulesMetadata[0].pos - ('NgModule'.length + 1) : appModuleFile.indexOf('@NgModule');

    /**
     * Insert import on top of the main module file
     *
     * @param name
     * @param file
     * @param isDefault
     */
    const insertImportToModuleFile = (name: string, file: string, isDefault?: boolean) => {
      const importChange = insertImport(sourceFile, moduleFilePath, name, file, isDefault);
      if (importChange instanceof InsertChange) {
        recorder.insertLeft(importChange.pos, importChange.toAdd);
      }
    };

    /**
     * Add import to the main module
     *
     * @param name
     * @param file
     * @param moduleFunction
     */
    const addImportToModuleFile = (name: string, file: string, moduleFunction?: string) => {
      if (new RegExp(name).test(appModuleFile.substring(moduleIndex))) {
        context.logger.warn(`Skipped ${name} (already imported)`);
        return;
      }
      addImportToModule(sourceFile, moduleFilePath, name, file)
        .forEach((change) => {
          if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, moduleFunction && change.pos > moduleIndex ? change.toAdd.replace(name, name + moduleFunction) : change.toAdd);
          }
        });
    };

    /**
     * Add providers to the main module
     *
     * @param name
     * @param file
     * @param customProvider
     */
    const addProviderToModuleFile = (name: string, file: string, customProvider?: string) => {
      if (new RegExp(name).test(appModuleFile.substring(moduleIndex))) {
        context.logger.warn(`Skipped ${name} (already provided)`);
        return;
      }
      addProviderToModule(sourceFile, moduleFilePath, name, file)
        .forEach((change) => {
          if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, customProvider && change.pos > moduleIndex ? change.toAdd.replace(name, customProvider) : change.toAdd);
          }
        });
    };

    /**
     * Add custom code before the module definition
     *
     * @param line
     */
    const insertBeforeModule = (line: string) => {
      recorder.insertLeft(moduleIndex - 1, `${line}\n\n`);
    };

    addImportToModuleFile(
      'TranslateModule',
      '@ngx-translate/core',
      `.forRoot({
        loader: translateLoaderProvider,
        compiler: {
          provide: TranslateCompiler,
          useClass: TranslateMessageFormatLazyCompiler
        }
      })`
    );
    addImportToModuleFile(
      'LocalizationModule',
      '@o3r/localization',
      '.forRoot(localizationConfigurationFactory)'
    );

    insertImportToModuleFile('TranslateCompiler', '@ngx-translate/core');
    insertImportToModuleFile('translateLoaderProvider', '@o3r/localization');
    insertImportToModuleFile('TranslateMessageFormatLazyCompiler', '@o3r/localization');
    insertImportToModuleFile('LocalizationConfiguration', '@o3r/localization');
    insertImportToModuleFile('registerLocaleData', '@angular/common');
    insertImportToModuleFile('localeEN', '@angular/common/locales/en', true);

    insertBeforeModule('registerLocaleData(localeEN, \'en-GB\');');

    insertBeforeModule(`export function localizationConfigurationFactory(): Partial<LocalizationConfiguration> {
  return {
    supportedLocales: ['en-GB'],
    fallbackLanguage: 'en-GB',
    bundlesOutputPath: 'localizations/', // TODO? get it from a property
    useDynamicContent: environment.production
  };
}`);

    addProviderToModuleFile('MESSAGE_FORMAT_CONFIG', '@o3r/localization', '{provide: MESSAGE_FORMAT_CONFIG, useValue: {}}');

    tree.commitUpdate(recorder);

    return tree;
  };

  /**
   * Set language as default on application bootstrap
   *
   * @param tree
   * @param context
   */
  const setDefaultLanguage: Rule = (tree: Tree, context: SchematicContext) => {
    const moduleFilePath = getAppModuleFilePath(tree, context);
    const componentFilePath = moduleFilePath && moduleFilePath.replace(/\.module\.ts$/i, '.component.ts');

    if (!(componentFilePath && tree.exists(componentFilePath))) {
      context.logger.warn(`File ${componentFilePath!} not found, the default language won't be set`);
      return tree;
    }

    const sourceFile = ts.createSourceFile(
      componentFilePath,
      tree.read(componentFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    // avoid overriding app component file if Localization service is already imported
    if (isImported(sourceFile, 'LocalizationService', '@otter/common') || isImported(sourceFile, 'LocalizationService', '@o3r/localization')) {
      return tree;
    }

    const recorder = tree.beginUpdate(componentFilePath);

    const insertImportToComponentFile = (name: string, file: string, isDefault?: boolean) => {
      const importChange = insertImport(sourceFile, componentFilePath, name, file, isDefault);
      if (importChange instanceof InsertChange) {
        recorder.insertLeft(importChange.pos, importChange.toAdd);
      }
    };

    insertImportToComponentFile('LocalizationService', '@o3r/localization');

    const constructorNode = findFirstNodeOfKind<ts.ConstructorDeclaration>(sourceFile, ts.SyntaxKind.Constructor);
    if (constructorNode) {
      const hasParam = !!constructorNode.parameters && constructorNode.parameters.length > 0;
      const pos = hasParam ? constructorNode.parameters[0].pos : constructorNode.pos + constructorNode.getText().indexOf('(') + 1;
      recorder.insertLeft(pos, `localizationService: LocalizationService${hasParam ? ', ' : ''}`);
      if (constructorNode.body) {
        recorder.insertLeft(constructorNode.body.end - 1, 'localizationService.useLanguage(\'en-GB\');');
      }
    } else {
      const classNode = findFirstNodeOfKind<ts.ClassDeclaration>(sourceFile, ts.SyntaxKind.ClassDeclaration);
      if (!classNode) {
        context.logger.warn(`No class found in ${componentFilePath}, the default language won't be set`);
      } else {
        const firstToken = classNode.members[0];
        if (firstToken) {
          recorder.insertLeft(firstToken.pos, '\n  constructor(localizationService: LocalizationService) { localizationService.useLanguage(\'en-GB\'); }');
        }
      }
    }

    tree.commitUpdate(recorder);
    return tree;
  };

  /**
   * Add mockTranslationModule to application tests.
   *
   * @param tree
   * @param context
   */
  const addMockTranslationModule: Rule = (tree: Tree, context: SchematicContext) => {
    const moduleFilePath = getAppModuleFilePath(tree, context);
    const componentSpecFilePath = moduleFilePath && moduleFilePath.replace(/\.module\.ts$/i, '.component.spec.ts');

    if (!(componentSpecFilePath && tree.exists(componentSpecFilePath))) {
      return tree;
    }

    const sourceFile = ts.createSourceFile(
      componentSpecFilePath,
      tree.read(componentSpecFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    // avoid overriding app component spec file if Localization mock is already imported
    if (isImported(sourceFile, 'mockTranslationModules', '@otter/common') || isImported(sourceFile, 'mockTranslationModules', '@o3r/testing/localization')) {
      return tree;
    }

    const recorder = tree.beginUpdate(componentSpecFilePath);

    const insertImportToComponentFile = (name: string, file: string, isDefault?: boolean) => {
      const importChange = insertImport(sourceFile, componentSpecFilePath, name, file, isDefault);
      if (importChange instanceof InsertChange) {
        recorder.insertLeft(importChange.pos, importChange.toAdd);
      }
    };

    insertImportToComponentFile('mockTranslationModules', '@o3r/testing/localization');

    const regExp = /TestBed\.configureTestingModule\({.*imports\s*:\s*\[(\s*)/s;
    const result = sourceFile.text.match(regExp);

    if (result && result.length && typeof result.index !== 'undefined') {
      recorder.insertRight(
        result.index + result[0].length,
        '...mockTranslationModules(),' + result[1]);
    }

    tree.commitUpdate(recorder);
    return tree;
  };

  /**
   * Add location required dependencies
   *
   * @param tree
   * @param _context
   */
  const addDependencies: Rule = (tree: Tree, _context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree);
    const type: NodeDependencyType = workspaceProject.projectType === 'application' ? NodeDependencyType.Default : NodeDependencyType.Peer;

    const depsRecord = getExternalDependenciesVersionRange(
      [ngxTranslateCoreDep, intlMessageFormatDep, formatjsIntlNumberformatDep, angularCdkDep],
      packageJsonPath
    );

    const dependencies: NodeDependency[] = getNodeDependencyList(depsRecord, type);

    dependencies.forEach((dep) => addPackageJsonDependency(tree, dep));

    return tree;
  };

  // Ignore generated CMS metadata
  const ignoreDevResourcesFiles = (tree: Tree, _context: SchematicContext) => {
    return ignorePatterns(tree, [{ description: 'Local Development resources files', patterns: ['/dev-resources'] }]);
  };

  return chain([
    generateLocalesFolder,
    updateAngularJson,
    updatePackageJson,
    addDependencies,
    registerModules,
    setDefaultLanguage,
    addMockTranslationModule,
    ignoreDevResourcesFiles
  ]);
}

/**
 *
 */
export function updateI18n(): Rule {

  /**
   * Add i18n generation builders into angular.json
   *
   * @param tree
   */
  const updateAngularJson: Rule = (tree: Tree) => {
    const workspace = readAngularJson(tree);
    const projectName = getDefaultProjectName(tree);
    const workspaceProject = getProjectFromTree(tree, projectName);

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    if (!workspaceProject.architect.i18n) {
      workspaceProject.architect.i18n ||= {
        builder: '@o3r/localization:i18n',
        options: {
          localizationConfigs: [{
            localizationFiles: workspace.schematics && workspace.schematics['@o3r/core:component']
              ? [workspace.schematics['@o3r/core:component'].path]
              : ['**/*.localization.json']
          }]
        }
      };
    }

    workspace.projects[projectName] = workspaceProject;
    return writeAngularJson(tree, workspace);
  };

  return chain([
    updateAngularJson
  ]);
}
