import * as path from 'node:path';
import {
  apply,
  applyToSubtree,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  findFirstNodeOfKind,
  getAppModuleFilePath,
  getModuleIndex,
  getPackageManagerRunner,
  getTemplateFolder,
  getWorkspaceConfig,
  ignorePatterns,
  insertBeforeModule as o3rInsertBeforeModule,
  insertImportToModuleFile as o3rInsertImportToModuleFile,
  readPackageJson,
  writeAngularJson,
} from '@o3r/schematics';
import {
  addRootImport,
  addRootProvider,
} from '@schematics/angular/utility';
import {
  insertImport,
  isImported,
} from '@schematics/angular/utility/ast-utils';
import {
  InsertChange,
} from '@schematics/angular/utility/change';
import * as ts from 'typescript';

/**
 * Add Otter localization support
 * @param options {@link RuleFactory.options}
 * @param options.projectName
 * @param rootPath {@link RuleFactory.rootPath}
 */
export function updateLocalization(options: { projectName?: string | null | undefined }, rootPath: string): Rule {
  const mainAssetsFolder = 'src/assets';
  const devResourcesFolder = 'dev-resources';

  /**
   * Generate locales folder
   * @param tree
   */
  const generateLocalesFolder: Rule = (tree: Tree) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectType = workspaceProject?.projectType || 'application';
    if (projectType === 'library') {
      return tree;
    }
    const workingDirectory = (options.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root) || '.';
    return mergeWith(apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({ empty: '' }),
      move(workingDirectory)
    ]), MergeStrategy.Overwrite);
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
    const distFolder: string = (
      workspaceProject
      && workspaceProject.architect
      && workspaceProject.architect.build
      && workspaceProject.architect.build.options
      && (
        (
          workspaceProject.architect.build.configurations
          && workspaceProject.architect.build.configurations.production
          && workspaceProject.architect.build.configurations.production.outputPath
        ) || workspaceProject.architect.build.options.outputPath
      )
    ) || './dist';

    // exit if not an application
    if (!workspace || !projectName || !workspaceProject || workspaceProject.projectType === 'library') {
      context.logger.debug('No application project found to add translation extraction');
      return tree;
    }

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    const projectBasePath = workspaceProject.root.replace(/[/\\]$/, '');

    workspaceProject.architect['generate-translations'] ||= {
      builder: '@o3r/transloco:localization',
      options: {
        browserTarget: `${projectName}:build`,
        localizationExtracterTarget: `${projectName}:extract-translations`,
        locales: [
          'en-GB'
        ],
        assets: [`${projectBasePath}/${mainAssetsFolder}/locales`],
        outputPath: `${projectBasePath}/${devResourcesFolder}/localizations`
      },
      configurations: {
        production: {
          outputPath: `${projectBasePath}/${distFolder}/localizations`
        }
      }
    };

    const pathTsconfigCms = path.posix.join(projectRoot, 'tsconfig.cms.json');
    workspaceProject.architect['extract-translations'] ||= {
      builder: '@o3r/transloco:extractor',
      options: {
        tsConfig: pathTsconfigCms.replace(/^\//, ''),
        libraries: []
      }
    };
    const localizationAssetsConfig = {
      glob: '**/*.json',
      input: `${projectBasePath}/${devResourcesFolder}/localizations`,
      output: '/localizations'
    };
    const projectType = workspaceProject?.projectType || 'application';
    if (projectType === 'application' && workspaceProject.architect.build) {
      const alreadyExistingBuildOption = workspaceProject.architect.build.options?.assets
        ?.map((a: { glob: string; input: string; output: string }) => a.output)
        .find((output: string) => output === '/localizations');

      if (!alreadyExistingBuildOption) {
        workspaceProject.architect.build.options ||= {};
        workspaceProject.architect.build.options.assets ||= [];
        workspaceProject.architect.build.options.assets.push(localizationAssetsConfig);
      }
    }

    if (workspaceProject.architect.test) {
      const alreadyExistingTestOption = workspaceProject.architect.test.options?.assets
        ?.map((a: { glob: string; input: string; output: string }) => a.output)
        .find((output: string) => output === '/localizations');
      if (!alreadyExistingTestOption) {
        workspaceProject.architect.test.options ||= {};
        workspaceProject.architect.test.options.assets ||= [];
        workspaceProject.architect.test.options.assets.push(localizationAssetsConfig);
      }
    }

    const targets = [
      `${projectName}:generate-translations`,
      `${projectName}:serve`
    ];
    if (workspaceProject.architect.run && workspaceProject.architect.run.options && Array.isArray(workspaceProject.architect.run.options.targets)) {
      workspaceProject.architect.run.options.targets.push(...targets);
      workspaceProject.architect.run.options.targets = (workspaceProject.architect.run.options.targets as string[])
        .reduce<string[]>((acc, target) => acc.includes(target) ? acc : [...acc, target], []);
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
    if (!projectName || !workspace || !workspaceProject || workspaceProject.projectType === 'library') {
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
    if (!moduleFilePath || !tree.exists(moduleFilePath)) {
      context.logger.warn(moduleFilePath
        ? `Module file not found under '${moduleFilePath}'. Localization modules not registered.`
        : 'No module file found. Localization modules not registered.');
      return tree;
    }

    const sourceFile = ts.createSourceFile(
      moduleFilePath,
      tree.read(moduleFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    // avoid overriding app module if Localization provider is already imported
    if (isImported(sourceFile, 'provideLocalization', '@o3r/transloco')) {
      return tree;
    }

    const recorder = tree.beginUpdate(moduleFilePath);
    const appModuleFile = tree.read(moduleFilePath)!.toString();
    const { moduleIndex } = getModuleIndex(sourceFile, appModuleFile);

    const addImportToModuleFile = (name: string, file: string, moduleFunction?: string) => additionalRules.push(
      addRootImport(options.projectName!, ({ code, external }) => code`${external(name, file)}${moduleFunction}`)
    );

    const insertImportToModuleFile = (name: string, file: string, isDefault?: boolean) =>
      o3rInsertImportToModuleFile(name, file, sourceFile, recorder, moduleFilePath, isDefault);

    const addProviderToModuleFile = (name: string, file: string, customProvider: string) => additionalRules.push(
      addRootProvider(options.projectName!, ({ code, external }) =>
        code`{provide: ${external(name, file)}, ${customProvider}}`)
    );

    const insertBeforeModule = (line: string) => o3rInsertBeforeModule(line, appModuleFile, recorder, moduleIndex);

    addImportToModuleFile(
      'TranslocoModule',
      '@jsverse/transloco',
      ''
    );
    additionalRules.push(
      addRootProvider(options.projectName!, ({ code, external }) =>
        code`${external('provideLocalization', '@o3r/transloco')}(localizationConfigurationFactory)`)
    );

    insertImportToModuleFile('translateLoaderProvider', '@o3r/transloco');
    insertImportToModuleFile('LocalizationConfiguration', '@o3r/transloco');
    insertImportToModuleFile('registerLocaleData', '@angular/common');
    insertImportToModuleFile('localeEN', '@angular/common/locales/en', true);
    insertImportToModuleFile('TRANSLOCO_LOADER', '@jsverse/transloco');

    insertBeforeModule('registerLocaleData(localeEN, \'en-GB\');');

    insertBeforeModule(`export function localizationConfigurationFactory(): Partial<LocalizationConfiguration> {
  return {
    supportedLocales: ['en-GB'],
    fallbackLanguage: 'en-GB',
    bundlesOutputPath: 'localizations/', // TODO? get it from a property
    useDynamicContent: environment.production
  };
}`);

    addProviderToModuleFile('MESSAGE_FORMAT_CONFIG', '@o3r/transloco', 'useValue: {}');
    addProviderToModuleFile('TRANSLOCO_LOADER', '@jsverse/transloco', 'useFactory: () => translateLoaderProvider');

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
    const componentFilePath = moduleFilePath && moduleFilePath.replace(/[.-](?:module|config)\.ts$/i, '.ts');

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
    if (isImported(sourceFile, 'LocalizationService', '@o3r/transloco')) {
      return tree;
    }

    const recorder = tree.beginUpdate(componentFilePath);

    const insertImportToComponentFile = (name: string, file: string, isDefault?: boolean) => {
      const importChange = insertImport(sourceFile, componentFilePath, name, file, isDefault);
      if (importChange instanceof InsertChange) {
        recorder.insertLeft(importChange.pos, importChange.toAdd);
      }
    };

    insertImportToComponentFile('LocalizationService', '@o3r/transloco');

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
      if (classNode) {
        const firstToken = classNode.members[0];
        if (firstToken) {
          recorder.insertLeft(firstToken.pos, '\n  constructor(localizationService: LocalizationService) { localizationService.useLanguage(\'en-GB\'); }');
        }
      } else {
        context.logger.warn(`No class found in ${componentFilePath}, the default language won't be set`);
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

    const possibleComponentSpecPaths = [
      moduleFilePath && moduleFilePath.replace(/\.(?:module|config)\.ts$/i, '.component.spec.ts'),
      moduleFilePath && moduleFilePath.replace(/\.(?:module|config)\.ts$/i, '.spec.ts')
    ];

    const componentSpecFilePath = possibleComponentSpecPaths.find((compPath) => compPath && tree.exists(compPath));

    if (!(componentSpecFilePath && tree.exists(componentSpecFilePath))) {
      return tree;
    }

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
    if (isImported(sourceFile, 'provideLocalizationMock', '@o3r/testing/transloco')) {
      return tree;
    }

    const recorder = tree.beginUpdate(componentSpecFilePath);

    const insertImportToComponentFile = (name: string, file: string, isDefault?: boolean) => {
      const importChange = insertImport(sourceFile, componentSpecFilePath, name, file, isDefault);
      if (importChange instanceof InsertChange) {
        recorder.insertLeft(importChange.pos, importChange.toAdd);
      }
    };

    insertImportToComponentFile('provideLocalizationMock', '@o3r/testing/transloco');

    const providersRegExp = /TestBed\.configureTestingModule\({[^}]*providers\s*:\s*\[([^\]]*)/s;
    const providersResult = sourceFile.text.match(providersRegExp);
    if (providersResult && providersResult.length > 0 && typeof providersResult.index !== 'undefined') {
      const providersArrayStart = providersResult.index + providersResult[0].length;
      recorder.insertRight(providersArrayStart, '...provideLocalizationMock(), ');
    }

    tree.commitUpdate(recorder);
    return tree;
  };

  // Ignore generated CMS metadata
  const ignoreDevResourcesFiles = (tree: Tree, _context: SchematicContext) => {
    const workingDirectory = (options.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root) || '.';

    return applyToSubtree(
      workingDirectory, [
        (subTree) => ignorePatterns(subTree, [
          { description: 'Local Development resources files', patterns: [`/${devResourcesFolder}`] },
          { description: 'CMS metadata files', patterns: ['/*.metadata.json'] }
        ])
      ]);
  };

  return chain([
    registerModules,
    generateLocalesFolder,
    updateAngularJson,
    updatePackageJson,
    setDefaultLanguage,
    addMockTranslationModule,
    ignoreDevResourcesFiles
  ]);
}

function updateI18nFn(options: { projectName?: string | undefined }): Rule {
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
        builder: '@o3r/transloco:i18n',
        options: {
          localizationConfigs: [{
            localizationFiles: workspace.schematics && workspace.schematics['@o3r/core:component']
              ? [workspace.schematics['@o3r/core:component'].path]
              : ['**/*-localization.json']
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

export const updateI18n = createOtterSchematic(updateI18nFn);
