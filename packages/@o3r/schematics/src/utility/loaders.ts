import { SchematicsException, Tree } from '@angular-devkit/schematics';
import * as commentJson from 'comment-json';
import { sync as globbySync } from 'globby';
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
 */
export function writeAngularJson(tree: Tree, workspace: WorkspaceSchema) {
  tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
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
 */
export function getProjectFromTree(tree: Tree, projectName?: string | null): WorkspaceProject {
  const workspace = readAngularJson(tree);
  return workspace.projects[projectName || workspace.defaultProject || Object.keys(workspace.projects)[0]];
}

/**
 * Get the default project name
 *
 * @param tree File tree
 */
export function getDefaultProjectName(tree: Tree): string {
  const workspace = readAngularJson(tree);
  return workspace.defaultProject || Object.keys(workspace.projects)[0];
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
 */
export function getAllFilesInTree(tree: Tree, basePath = '/'): string[] {
  return [
    ...tree.getDir(basePath).subfiles.map((file) => path.posix.join(basePath, file)),
    ...tree.getDir(basePath).subdirs
      .map((dir) => getAllFilesInTree(tree, path.posix.join(basePath, dir)))
      .flat()
  ];
}

/**
 * Get all files with specific extension from the specified folder for all the projects described in the workspace
 *
 * @deprecated please use `getFilesInFolderFromWorkspaceProjectsInTree`, will be removed in v9
 * @param tree
 * @param extension
 * @param folderInProject
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
 * @param extension
 * @param folderInProject
 */
export function getFilesInFolderFromWorkspaceProjectsInTree(tree: Tree, folderInProject: string, extension: string) {
  const workspace = readAngularJson(tree);
  const projectSources = Object.values(workspace.projects)
    .map((project) => path.posix
      .join(project.root, folderInProject, '**', `*\\.${extension}$`)
      .replace(/([^*])\*([^*]|$)/g, '$1[^/]*$2')
      .replace(/\*\*/g, '.*')
      .replace(/\/$/, '')
    );

  const files = getAllFilesInTree(tree);
  const excludes = /.*\/node_modules\/.*/;
  return projectSources.flatMap((projectSource) => {
    const regexp = new RegExp(projectSource);
    return files.filter((file) => regexp.test(file) && !excludes.test(file));
  });
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
