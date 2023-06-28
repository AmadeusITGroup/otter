import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as commentJson from 'comment-json';
import { sync as globbySync } from 'globby';
import { minimatch } from 'minimatch';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import type { WorkspaceProject, WorkspaceSchema } from '../interfaces/index';

/**
 * Load the angular.json file
 *
 * @param tree File tree
 * @param angularJsonFile Angular.json file path
 * @throws Angular JSON invalid or non exist
 */
export function readAngularJson(tree: Tree, angularJsonFile = '/angular.json'): WorkspaceSchema {
  const workspaceConfig = tree.read(angularJsonFile);
  if (!workspaceConfig) {
    throw new SchematicsException('Could not find Angular workspace configuration');
  }

  return commentJson.parse(workspaceConfig.toString()) as any;
}

/**
 * Update angular.json file
 *
 * @param tree File tree
 * @param workspace Angular workspace
 * @param angularJsonFile Angular.json file path
 */
export function writeAngularJson(tree: Tree, workspace: WorkspaceSchema, angularJsonFile = '/angular.json') {
  tree.overwrite(angularJsonFile, commentJson.stringify(workspace, null, 2));
  return tree;
}

/**
 * Load the target's package.json file
 *
 * @param tree File tree
 * @param workspaceProject Angular workspace project
 * @throws Package JSON invalid or non exist
 */
export function readPackageJson(tree: Tree, workspaceProject: WorkspaceProject) {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const workspaceConfig = tree.read(`${workspaceProject.root}/package.json`);
  if (!workspaceConfig) {
    throw new SchematicsException('Could not find NPM Package');
  }

  return commentJson.parse(workspaceConfig.toString()) as PackageJson;
}

/**
 * Get the workspace project
 *
 * @param tree File tree
 * @param projectName Name of the Angular project
 * @param projectType
 */
export function getProjectFromTree(tree: Tree, projectName?: string | null, projectType?: 'application' | 'library'): WorkspaceProject & { name: string } | undefined {
  const workspace = readAngularJson(tree);
  const projectGuessedName = projectName || Object.keys(workspace.projects)[0];
  // eslint-disable-next-line max-len
  let workspaceProject: WorkspaceProject & { name: string } | undefined = projectGuessedName && workspace.projects[projectGuessedName] && (!projectType || workspace.projects[projectGuessedName]?.projectType === projectType) ?
    {
      ...workspace.projects[projectGuessedName],
      name: projectGuessedName
    } :
    undefined;

  // if not found we fallback to the more relevant first one
  if (!workspaceProject) {
    workspaceProject = Object.entries(workspace.projects)
      .filter(([, project]) => !projectType || project.projectType === projectType)
      .map(([name, project]) => ({ ...project, name }))[0];
  }
  return workspaceProject;
}

/**
 * Return the type of install to run depending on the project type (Peer or default)
 *
 * @param tree
 */
export function getProjectDepType(tree: Tree) {
  const workspaceProject = tree.exists('angular.json') ? getProjectFromTree(tree) : undefined;
  const projectType = workspaceProject?.projectType || 'application';
  return projectType === 'application' ? NodeDependencyType.Default : NodeDependencyType.Peer;
}

/**
 * Get the default project name
 *
 * @deprecated use {@link getProjectFromTree} function instead, will be removed in Otter V10
 * @param projectType
 * @param tree File tree
 */
export function getDefaultProjectName(tree: Tree, projectType?: 'application' | 'library'): string | undefined {
  return getProjectFromTree(tree, null, projectType)?.name;
}

/**
 * Get the folder of the templates for a specific sub-schematics
 *
 * @param rootPath Root directory of the schematics ran
 * @param currentPath Directory of the current sub-schematics ran
 * @param templateFolder Folder containing the templates
 */
export function getTemplateFolder(rootPath: string, currentPath: string, templateFolder = 'templates') {
  const templateFolderPath = path.resolve(currentPath, templateFolder).replace(/[\\]/g, '/');
  return path.relative(rootPath, templateFolderPath);
}

/**
 * Get the path of all the files in the Tree
 *
 * @param basePath Base path from which starting the list
 * @param tree Schematics file tree
 * @param excludes Array of globs to be ignored
 */
export function getAllFilesInTree(tree: Tree, basePath = '/', excludes: string[] = []): string[] {
  if (excludes.length && excludes.some((e) => minimatch(basePath, e, {dot: true}))) {
    return [];
  }
  return [
    ...tree.getDir(basePath).subfiles.map((file) => path.posix.join(basePath, file)),
    ...tree.getDir(basePath).subdirs
      .flatMap((dir) => getAllFilesInTree(tree, path.posix.join(basePath, dir), excludes))
  ];
}

/**
 * Get all files with specific extension from the specified folder for all the projects described in the workspace
 *
 * @deprecated please use {@link getFilesInFolderFromWorkspaceProjectsInTree}, will be removed in v9
 * @param tree
 * @param folderInProject
 * @param extension
 */
export function getFilesInFolderFromWorkspaceProjects(tree: Tree, folderInProject: string, extension: string) {
  const workspace = readAngularJson(tree);
  const projectSources = Object.values(workspace.projects)
    .map((project) => path.join(project.root, folderInProject, '**', `*.${extension}`).replace(/\\/g, '/'));

  return projectSources.reduce((acc, projectSource) => {
    acc.push(...globbySync(projectSource, {ignore: ['**/node_modules/**']}));
    return acc;
  }, [] as string[]);
}

/**
 * Get all files with specific extension from the specified folder for all the projects described in the workspace
 *
 * @param tree
 * @param folderInProject
 * @param extension
 */
export function getFilesInFolderFromWorkspaceProjectsInTree(tree: Tree, folderInProject: string, extension: string) {
  const workspace = readAngularJson(tree);
  const extensionMatcher = new RegExp(`\\.${extension.replace(/^\./, '')}$`);
  const excludes = ['**/node_modules/**', '**/.cache/**'];
  return Object.values(workspace.projects)
    .flatMap((project) => getAllFilesInTree(tree, path.posix.join(project.root, folderInProject), excludes))
    .filter((filePath) => extensionMatcher.test(filePath));
}


/**
 * Get all files with specific extension from the tree
 *
 * @param tree
 * @param extension
 */
export function getFilesWithExtensionFromTree(tree: Tree, extension: string) {
  const excludes = ['**/node_modules/**', '**/.cache/**'];
  const extensionMatcher = new RegExp(`\\.${extension}$`);
  return getAllFilesInTree(tree, '/', excludes)
    .filter((filePath) => extensionMatcher.test(filePath));
}

/**
 * Get all files with specific extension from the root of all the projects described in the workspace
 *
 * @param tree
 * @param extension
 */
export function getFilesFromRootOfWorkspaceProjects(tree: Tree, extension: string) {
  return getFilesInFolderFromWorkspaceProjects(tree, '', extension);
}

/**
 * Get all files with specific extension from the src folder for all the projects described in the workspace
 *
 * @param tree
 * @param extension
 */
export function getFilesFromWorkspaceProjects(tree: Tree, extension: string) {
  return getFilesInFolderFromWorkspaceProjects(tree, 'src', extension);
}


/**
 * Get all the typescript files from the src folder for all the projects described in the workspace
 *
 * @param tree
 */
export function getSourceFilesFromWorkspaceProjects(tree: Tree) {
  return getFilesFromWorkspaceProjects(tree, 'ts');
}
