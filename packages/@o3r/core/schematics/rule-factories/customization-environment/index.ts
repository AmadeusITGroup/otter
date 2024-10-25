import {
  posix
} from 'node:path';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  UpdateRecorder,
  url
} from '@angular-devkit/schematics';
import {
  getFileInfo,
  getTemplateFolder,
  getWorkspaceConfig,
  ngAddPackages,
  insertBeforeModule as o3rInsertBeforeModule,
  insertImportToModuleFile as o3rInsertImportToModuleFile
} from '@o3r/schematics';
import {
  addRootImport,
  addRootProvider
} from '@schematics/angular/utility';
import {
  isImported
} from '@schematics/angular/utility/ast-utils';
import {
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';

/**
 * Enable customization capabilities
 * @param rootPath @see RuleFactory.rootPath
 * @param o3rCoreVersion
 * @param options
 * @param options.projectName
 * @param isLibrary
 */
export function updateCustomizationEnvironment(rootPath: string, o3rCoreVersion?: string, options?: { projectName?: string | undefined }, isLibrary?: boolean): Rule {
  /**
   * Generate customization folder
   * @param tree
   * @param context
   */
  const generateC11nFolder = (tree: Tree, context: SchematicContext) => {
    const workingDirectory = (options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root) || '.';
    if (tree.exists(posix.join(workingDirectory, 'src', 'customization', 'presenters-map.empty.ts'))) {
      return tree;
    }
    const templateSource = apply(
      url(getTemplateFolder(rootPath, __dirname)),
      [
        template({}),
        renameTemplateFiles(),
        move(workingDirectory)
      ]
    );

    return mergeWith(templateSource, MergeStrategy.Default)(tree, context);
  };

  /**
   * Edit main module with the customization required information
   * @param tree
   * @param context
   */
  const registerModules: Rule = (tree: Tree, context: SchematicContext) => {
    const additionalRules: Rule[] = [];
    const fileInfo = getFileInfo(tree, context, options?.projectName);
    if (!fileInfo.moduleFilePath || !fileInfo.appModuleFile || !fileInfo.sourceFile) {
      return tree;
    }

    // if we already have the customization module imported do nothing to avoid overriding custom configs with the empty ones
    if (isImported(fileInfo.sourceFile, 'C11nModule', '@otter/common') || isImported(fileInfo.sourceFile, 'C11nModule', '@o3r/components')) {
      return tree;
    }

    const fileContent = tree.readText(fileInfo.moduleFilePath).replace(/\s*/g, '');
    const recorder = tree.beginUpdate(fileInfo.moduleFilePath);
    const moduleIndex = fileInfo.moduleIndex;

    /**
     * Insert import on top of the main module file
     * @param rec
     * @param name
     * @param file
     * @param isDefault
     */
    const insertImportToModuleFile = (rec: UpdateRecorder, name: string, file: string, isDefault?: boolean) =>
      o3rInsertImportToModuleFile(name, file, fileInfo.sourceFile!, rec, fileInfo.moduleFilePath!, isDefault);

    /**
     * Add custom code before the module definition
     * @param rec
     * @param line
     */
    const insertBeforeModule = (rec: UpdateRecorder, line: string) => o3rInsertBeforeModule(line, fileContent, rec, moduleIndex);

    let updatedRecorder = recorder;

    updatedRecorder = insertImportToModuleFile(updatedRecorder, 'initializeEntryComponents', '../customization/presenters-map.empty');
    updatedRecorder = insertImportToModuleFile(updatedRecorder, 'registerCustomComponents', '../customization/presenters-map.empty');
    updatedRecorder = insertImportToModuleFile(updatedRecorder, 'Provider', '@angular/core');
    updatedRecorder = insertImportToModuleFile(updatedRecorder, 'initializeCustomProviders', '../customization/custom-providers.empty');

    additionalRules.push(
      addRootImport(options?.projectName!, ({ code }) => code`...entry.customComponentsModules`),
      addRootProvider(options?.projectName!, ({ code }) => code`...customProviders`),
      addRootImport(options?.projectName!, ({ code }) => code`C11nModule.forRoot({registerCompFunc: registerCustomComponents})`)
    );
    updatedRecorder = insertImportToModuleFile(updatedRecorder, 'C11nModule', '@o3r/components');

    updatedRecorder = insertBeforeModule(updatedRecorder, 'const entry = initializeEntryComponents();');

    updatedRecorder = insertBeforeModule(updatedRecorder, 'const customProviders: Provider[] = initializeCustomProviders();');

    tree.commitUpdate(updatedRecorder);

    return chain(additionalRules)(tree, context);
  };

  return (tree, _context) => {
    const workingDirectory = (options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root) || '.';

    return chain([
      generateC11nFolder,
      registerModules,
      ngAddPackages(['@o3r/components', '@o3r/configuration'], {
        skipConfirmation: true,
        version: o3rCoreVersion,
        parentPackageInfo: '@o3r/core - customization environment update',
        projectName: options?.projectName,
        dependencyType: isLibrary ? NodeDependencyType.Peer : NodeDependencyType.Default,
        workingDirectory
      })
    ]);
  };
}
