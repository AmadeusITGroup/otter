import { apply, chain, MergeStrategy, mergeWith, move, noop, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import {
  createSchematicWithMetricsIfInstalled,
  type DependencyToAdd,
  findFirstNodeOfKind,
  getAppModuleFilePath,
  getModuleIndex,
  getPackageManagerRunner,
  getProjectNewDependenciesTypes,
  getTemplateFolder,
  getWorkspaceConfig,
  ignorePatterns,
  insertBeforeModule as o3rInsertBeforeModule,
  insertImportToModuleFile as o3rInsertImportToModuleFile,
  readPackageJson,
  setupDependencies,
  writeAngularJson
} from '@o3r/schematics';
import {
  insertImport,
  isImported
} from '@schematics/angular/utility/ast-utils';
import { addRootImport, addRootProvider } from '@schematics/angular/utility';
import { InsertChange } from '@schematics/angular/utility/change';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as ts from 'typescript';
import type { PackageJson } from 'type-fest';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
const ownPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' })) as PackageJson;

/**
 * Add Otter localization support
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateLocalization(options: { projectName?: string | null | undefined }, rootPath: string): Rule {
  if (!options.projectName) {
    return noop;
  }
  const mainAssetsFolder = 'src/assets';
  const devResourcesFolder = 'dev-resources';

  /**
   * Generate locales folder
   * @param tree
   * @param context
   */
  const generateLocalesFolder = (tree: Tree, context: SchematicContext) => {
    const workingDirectory = (options.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root) || '.';

    let gitIgnoreContent = '';
    const gitIgnorePath = path.posix.join(workingDirectory, '.gitignore');
    if (tree.exists(gitIgnorePath)) {
      gitIgnoreContent = tree.read(gitIgnorePath)!.toString();
      if (gitIgnoreContent.indexOf('/*.metadata.json')) {
        return tree;
      }
      tree.delete(gitIgnorePath);
    }

    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        empty: '',
        devResourcesFolder,
        gitIgnoreContent,
        mainAssetsFolder
      }),
      move(workingDirectory)
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return rule(tree, context);
  };

  /**
   * Add translation generation builders into angular.json
   * @param tree
   * @param context
   */
  const updateAngularJson: Rule = (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspaceConfig(tree);
    const projectName = options.projectName;
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;
    const projectRoot = path.posix.join(workspaceProject?.root || '');
    const distFolder: string =
      (
        workspaceProject &&
        workspaceProject.architect &&
        workspaceProject.architect.build &&
        workspaceProject.architect.build.options &&
        (
          workspaceProject.architect.build.configurations && workspaceProject.architect.build.configurations.production && workspaceProject.architect.build.configurations.production.outputPath ||
          workspaceProject.architect.build.options.outputPath
        )
      ) || './dist';

    // exit if not an application
    if (!workspace || !projectName || !workspaceProject) {
      context.logger.debug('No application project found to add translation extraction');
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

    const pathTsconfigCms = path.posix.join(projectRoot, 'tsconfig.cms.json');
    workspaceProject.architect['extract-translations'] ||= {
      builder: '@o3r/localization:extractor',
      options: {
        tsConfig: pathTsconfigCms.replace(/^\//, ''),
        libraries: []
      }
    };

    if (!tree.exists(pathTsconfigCms)) {
      const tsconfigCms = {
        extends: `./${tree.exists(path.posix.join(projectRoot, 'tsconfig.build.json')) ? 'tsconfig.build' : 'tsconfig.json'}`,
        include: [
          'src/**/*.component.ts',
          'src/**/*.config.ts',
          'src/**/*.module.ts'
        ]
      };
      tree.create(pathTsconfigCms, JSON.stringify(tsconfigCms, null, 2));
    } else {
      const localizationSourceRegExps = ['src/**/*.component.ts'];
      const tsconfigCms = tree.readJson(pathTsconfigCms) as Record<string, any>;
      if (!Array.isArray(tsconfigCms.include) || !localizationSourceRegExps.some((r) => tsconfigCms.include.includes(r))) {
        tsconfigCms.include ||= [];
        tsconfigCms.include.push(
          ...localizationSourceRegExps
            .filter((r) => !tsconfigCms.include.includes(r))
        );
        tree.overwrite(pathTsconfigCms, JSON.stringify(tsconfigCms, null, 2));
      }
    }

    if (workspaceProject.architect.build) {
      const alreadyExistingBuildOption =
        workspaceProject.architect.build.options?.assets?.map((a: { glob: string; input: string; output: string }) => a.output).find((output: string) => output === '/localizations');

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
        workspaceProject.architect.test.options?.assets?.map((a: { glob: string; input: string; output: string }) => a.output).find((output: string) => output === '/localizations');
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
   * @param tree
   * @param context
   */
  const updatePackageJson: Rule = (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspaceConfig(tree);
    const projectName = options.projectName;
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;
    const packageManagerRunner = getPackageManagerRunner(getWorkspaceConfig(tree));
    if (!projectName || !workspace || !workspaceProject) {
      context.logger.debug('No application project found to add translation extraction');
      return tree;
    }

    const packageJson = readPackageJson(tree, workspaceProject);

    packageJson.scripts = packageJson.scripts || {};
    if (packageJson.scripts && packageJson.scripts.start && packageJson.scripts.start !== `ng run ${projectName}:run`) {
      packageJson.scripts['start:no-translation'] ||= packageJson.scripts.start;
    }
    if (packageJson.scripts.watch) {
      delete packageJson.scripts.watch;
    }
    packageJson.scripts.start ||= `ng run ${projectName}:run`;
    if (packageJson.scripts.build?.indexOf('generate:translations') === -1) {
      packageJson.scripts.build = `${packageManagerRunner} generate:translations && ${packageJson.scripts.build}`;
    }
    packageJson.scripts['generate:translations:dev'] ||= `ng run ${projectName}:generate-translations`;
    packageJson.scripts['generate:translations'] ||= `ng run ${projectName}:generate-translations:production`;

    tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));
  };

  /**
   * Edit main module with the translation required configuration
   * @param tree
   * @param context
   */
  const registerModules: Rule = (tree: Tree, context: SchematicContext) => {
    const additionalRules: Rule[] = [];
    const moduleFilePath = getAppModuleFilePath(tree, context, options.projectName);
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
    const appModuleFile = tree.read(moduleFilePath)!.toString();
    const { moduleIndex } = getModuleIndex(sourceFile, appModuleFile);

    const addImportToModuleFile = (name: string, file: string, moduleFunction?: string) => additionalRules.push(
      addRootImport(options.projectName!, ({code, external}) => code`${external(name, file)}${moduleFunction}`)
    );

    const insertImportToModuleFile = (name: string, file: string, isDefault?: boolean) =>
      o3rInsertImportToModuleFile(name, file, sourceFile, recorder, moduleFilePath, isDefault);

    const addProviderToModuleFile = (name: string, file: string, customProvider: string) => additionalRules.push(
      addRootProvider(options.projectName!, ({code, external}) =>
        code`{provide: ${external(name, file)}, ${customProvider}}`)
    );

    const insertBeforeModule = (line: string) => o3rInsertBeforeModule(line, appModuleFile, recorder, moduleIndex);

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

    addProviderToModuleFile('MESSAGE_FORMAT_CONFIG', '@o3r/localization', 'useValue: {}');

    tree.commitUpdate(recorder);
    if (!isImported(sourceFile, 'environment', '../environments/environment')) {
      insertImportToModuleFile('environment', '../environments/environment');
    }

    return chain(additionalRules)(tree, context);
  };

  /**
   * Set language as default on application bootstrap
   * @param tree
   * @param context
   */
  const setDefaultLanguage: Rule = (tree: Tree, context: SchematicContext) => {
    const moduleFilePath = getAppModuleFilePath(tree, context, options.projectName);
    const componentFilePath = moduleFilePath && moduleFilePath.replace(/\.(?:module|config)\.ts$/i, '.component.ts');

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
   * @param tree
   * @param context
   */
  const addMockTranslationModule: Rule = (tree: Tree, context: SchematicContext) => {
    const moduleFilePath = getAppModuleFilePath(tree, context, options.projectName);
    const componentSpecFilePath = moduleFilePath && moduleFilePath.replace(/\.(?:module|config)\.ts$/i, '.component.spec.ts');

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
   * @param tree
   */
  const addDependencies: Rule = (tree: Tree) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const types = getProjectNewDependenciesTypes(workspaceProject);
    const generatorDependencies = ['@ngx-translate/core', 'intl-messageformat', '@formatjs/intl-numberformat', '@angular/cdk'];
    const dependencies = generatorDependencies.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: ownPackageJson.peerDependencies![dep],
          types
        }]
      };
      return acc;
    }, {} as Record<string, DependencyToAdd>);
    return setupDependencies({
      projectName: options.projectName || undefined,
      dependencies
    });
  };

  // Ignore generated CMS metadata
  const ignoreDevResourcesFiles = (tree: Tree, _context: SchematicContext) => {
    return ignorePatterns(tree, [{description: 'Local Development resources files', patterns: ['/dev-resources']}]);
  };

  return chain([
    registerModules,
    generateLocalesFolder,
    updateAngularJson,
    updatePackageJson,
    addDependencies,
    setDefaultLanguage,
    addMockTranslationModule,
    ignoreDevResourcesFiles
  ]);
}

/**
 *
 * @param options
 * @param options.projectName
 */
function updateI18nFn(options: {projectName?: string | undefined}): Rule {
  if (!options.projectName) {
    return noop;
  }
  /**
   * Add i18n generation builders into angular.json
   * @param tree
   */
  const updateAngularJson: Rule = (tree: Tree) => {
    const workspace = getWorkspaceConfig(tree);
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;

    if (!workspace || !workspaceProject) {
      return tree;
    }

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

    workspace.projects[options.projectName!] = workspaceProject;
    return writeAngularJson(tree, workspace);
  };

  return chain([
    updateAngularJson
  ]);
}

export const updateI18n = createSchematicWithMetricsIfInstalled(updateI18nFn);
