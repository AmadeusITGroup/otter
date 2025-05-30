import {
  posix,
} from 'node:path';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import {
  applyEditorConfig,
  getAllFilesInTree,
  getTemplateFolder,
  getWorkspaceConfig,
} from '@o3r/schematics';

/**
 * Add or update the Linter configuration
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateLinterConfigs(options: { projectName?: string | null | undefined }, rootPath: string): Rule {
  /**
   * Update or create the eslint.json file
   * @param tree
   * @param context
   */
  const updateTslintExtend: Rule = (tree, context) => {
    const eslintFilePath = '/.eslintrc.json';

    if (tree.exists(eslintFilePath)) {
      const eslintFile = tree.readJson(eslintFilePath) as { extends?: string | string[] };
      eslintFile.extends = eslintFile.extends ? (Array.isArray(eslintFile.extends) ? eslintFile.extends : [eslintFile.extends]) : [];

      const eslintConfigOtter = '@o3r/eslint-config-otter';
      if (!eslintFile.extends.includes(eslintConfigOtter)) {
        eslintFile.extends.push(eslintConfigOtter);
      }

      tree.overwrite(eslintFilePath, JSON.stringify(eslintFile, null, 2));
    } else {
      const eslintConfigFiles = getAllFilesInTree(tree, '/', ['**/.eslintrc.js'], false).filter((file) => /\.eslintrc/i.test(file));
      if (eslintConfigFiles.length === 0) {
        return mergeWith(apply(url(getTemplateFolder(rootPath, __dirname, 'templates/workspace')), [
          template({
            dot: '.'
          }),
          renameTemplateFiles()
        ]), MergeStrategy.Overwrite);
      } else {
        context.logger.warn('An unsupported format ESLint configuration already exists, an automatic update cannot be applied.');
        context.logger.warn(`You can manually extend "@o3r/eslint-config-otter" in your configuration ${eslintConfigFiles.map((f) => `"${f}"`).join(', ')}`);
        return;
      }
    }
  };

  /**
   * Create linter files for the project
   * @param tree
   * @param context
   */
  const createProjectFiles: Rule = (tree, context) => {
    if (!options.projectName) {
      return;
    }
    const workspace = getWorkspaceConfig(tree);
    if (!workspace) {
      return;
    }
    const workspaceProject = workspace.projects[options.projectName];

    if (!workspaceProject) {
      context.logger.warn('No project detected, linter task can not be added.');
      return;
    }
    const projectRoot = workspaceProject.root;
    const projectType = workspaceProject.projectType;
    const eslintFilePath = posix.join(projectRoot, '/.eslintrc.js');

    if (tree.exists(eslintFilePath)) {
      context.logger.info(`${eslintFilePath} already exists.`);
      return;
    } else {
      const rootRelativePath = posix.relative(projectRoot, tree.root.path.replace(/^\//, './'));
      return mergeWith(apply(url(getTemplateFolder(rootPath, __dirname, 'templates/project')), [
        template({
          dot: '.',
          projectTsConfig: projectType === 'application' ? 'tsconfig.app' : 'tsconfig.lib',
          rootRelativePath
        }),
        move(projectRoot),
        renameTemplateFiles()
      ]), MergeStrategy.Overwrite);
    }
  };
  /**
   * Update angular.json file to use ESLint builder.
   * @param tree
   * @param context
   */
  const editAngularJson: Rule = (tree, context) => {
    const workspace = getWorkspaceConfig(tree);
    if (!workspace) {
      return;
    }
    const workspaceProject = options.projectName ? workspace.projects[options.projectName] : undefined;

    if (!workspaceProject) {
      context.logger.warn('No project detected, linter task can not be added.');
      return;
    }

    workspaceProject.architect ||= {};
    workspaceProject.architect.lint ||= {
      builder: '@angular-eslint/builder:lint',
      options: {
        eslintConfig: `${workspaceProject.root}/.eslintrc.js`,
        lintFilePatterns: [
          `${workspaceProject.sourceRoot || posix.join(workspaceProject.root, 'src')}/**/*.ts`
        ]
      }
    };

    workspace.projects[options.projectName!] = workspaceProject;
    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
  };

  /**
   * Handle linter errors to comply with Otter rules
   * @param tree
   * @param context
   */
  const handleOtterEslintErrors: Rule = (tree, context) => {
    if (!options.projectName) {
      return;
    }
    const workspace = getWorkspaceConfig(tree);
    if (!workspace) {
      return;
    }
    const workspaceProject = workspace.projects[options.projectName];

    if (!workspaceProject) {
      context.logger.warn('No project detected, linter task can not be added.');
      return;
    }
    const projectRoot = workspaceProject.root;
    const mainTsPath = posix.join(projectRoot, 'src/main.ts');
    if (tree.exists(mainTsPath)) {
      const mainTsContent = tree.readText(mainTsPath);
      tree.overwrite(mainTsPath, '/* eslint-disable no-console */\n' + mainTsContent);
    } else {
      context.logger.warn(`No file found under '${mainTsPath}'. Linter errors may occur and should be fixed by hand.`);
    }
  };
  return chain([
    updateTslintExtend,
    createProjectFiles,
    editAngularJson,
    handleOtterEslintErrors,
    applyEditorConfig()
  ]);
}
