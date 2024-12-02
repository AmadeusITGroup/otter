import * as path from 'node:path';
import type {
  DirEntry,
  FileEntry,
} from '@angular-devkit/schematics';
import {
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {
  minimatch,
} from 'minimatch';
import type {
  PackageJson,
} from 'type-fest';
import type {
  WorkspaceProject,
  WorkspaceSchema,
} from '../interfaces/index';

function findFilesInTreeRec(memory: Set<FileEntry>, directory: DirEntry, fileMatchesCriteria: (file: string) => boolean, ignoreDirectories: string[]) {
  if (ignoreDirectories.some((i) => directory.path.split(path.posix.sep).includes(i))) {
    return memory;
  }

  directory.subfiles
    .filter((file) => fileMatchesCriteria(file))
    .forEach((file) => memory.add(directory.file(file)!));

  directory.subdirs
    .forEach((dir) => findFilesInTreeRec(memory, directory.dir(dir), fileMatchesCriteria, ignoreDirectories));

  return memory;
}

/**
 *
 * Helper function that looks for files in the Tree
 * @param directory where to perform the search
 * @param fileMatchesCriteria a function defining the criteria to look for
 * @param ignoreDirectories optional parameter to ignore folders
 */
export function findFilesInTree(directory: DirEntry, fileMatchesCriteria: (file: string) => boolean, ignoreDirectories: string[] = ['node_modules', '.git', '.yarn']) {
  const memory = new Set<FileEntry>();
  findFilesInTreeRec(memory, directory, fileMatchesCriteria, ignoreDirectories);
  return Array.from(memory);
}

/**
 * Load the Workspace configuration object
 * @param tree File tree
 * @param workspaceConfigFile Workspace config file path, /angular.json in an Angular project
 * @returns null if the given config file does not exist
 */
export function getWorkspaceConfig<T extends WorkspaceSchema = WorkspaceSchema>(tree: Tree, workspaceConfigFile = '/angular.json'): WorkspaceSchema | null {
  if (!tree.exists(workspaceConfigFile)) {
    return null;
  }
  return tree.readJson(workspaceConfigFile) as unknown as T;
}

/**
 * Update angular.json file
 * @param tree File tree
 * @param workspace Angular workspace
 * @param angularJsonFile Angular.json file path
 */
export function writeAngularJson(tree: Tree, workspace: WorkspaceSchema, angularJsonFile = '/angular.json') {
  tree.overwrite(angularJsonFile, JSON.stringify(workspace, null, 2));
  return tree;
}

/**
 * Load the target's package.json file
 * @param tree File tree
 * @param workspaceProject Angular workspace project
 * @throws Package JSON invalid or non exist
 */
export function readPackageJson(tree: Tree, workspaceProject: WorkspaceProject) {
  const packageJsonPath = `${workspaceProject.root}/package.json`;
  if (!tree.exists(packageJsonPath)) {
    throw new SchematicsException('Could not find NPM Package');
  }

  const workspaceConfig = tree.readJson(packageJsonPath);
  return workspaceConfig as PackageJson;
}

/**
 * Return the types of install to run depending on the project type
 * @param project
 */
export function getProjectNewDependenciesTypes(project?: WorkspaceProject): NodeDependencyType[] {
  return project?.projectType === 'library' ? [NodeDependencyType.Peer, NodeDependencyType.Dev] : [NodeDependencyType.Default];
}

/**
 * Get the folder of the templates for a specific sub-schematics
 * @param rootPath Root directory of the schematics ran
 * @param currentPath Directory of the current sub-schematics ran
 * @param templateFolder Folder containing the templates
 */
export function getTemplateFolder(rootPath: string, currentPath: string, templateFolder = 'templates') {
  const templateFolderPath = path.resolve(currentPath, templateFolder).replace(/\\/g, '/');
  return path.relative(rootPath, templateFolderPath);
}

/**
 * Get the path of all the files in the Tree
 * @param tree Schematics file tree
 * @param basePath Base path from which starting the list
 * @param excludes Array of globs to be ignored
 * @param recursive determine if the function will walk through the sub folders
 */
export function getAllFilesInTree(tree: Tree, basePath = '/', excludes: string[] = [], recursive = true): string[] {
  if (excludes.some((e) => minimatch(basePath, e, { dot: true }))) {
    return [];
  }
  return [
    ...tree.getDir(basePath).subfiles.map((file) => path.posix.join(basePath, file)),
    ...(recursive ? tree.getDir(basePath).subdirs.flatMap((dir) => getAllFilesInTree(tree, path.posix.join(basePath, dir), excludes, recursive)) : [])
  ];
}

/**
 * Get the path of all the files in the Tree
 * @param tree Schematics file tree
 * @param patterns Array of globs to be search in the tree
 */
export function globInTree(tree: Tree, patterns: string[]): string[] {
  const files = getAllFilesInTree(tree);
  return files.filter((basePath) => patterns.some((p) => minimatch(basePath, p, { dot: true })));
}

/**
 * Get all files with specific extension from the specified folder for all the projects described in the workspace
 * @param tree
 * @param folderInProject
 * @param extension
 */
export function getFilesInFolderFromWorkspaceProjectsInTree(tree: Tree, folderInProject: string, extension: string) {
  const workspace = getWorkspaceConfig(tree);
  const extensionMatcher = new RegExp(`\\.${extension.replace(/^\./, '')}$`);
  const excludes = ['**/node_modules/**', '**/.cache/**'];
  return Object.values(workspace?.projects || {})
    .flatMap((project) => getAllFilesInTree(tree, path.posix.join(project.root, folderInProject), excludes))
    .filter((filePath) => extensionMatcher.test(filePath));
}

/**
 * Get all files with specific extension from the tree
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
 * @param tree
 * @param extension
 */
export function getFilesFromRootOfWorkspaceProjects(tree: Tree, extension: string) {
  return getFilesInFolderFromWorkspaceProjectsInTree(tree, '', extension);
}

/**
 * Get all files with specific extension from the src folder for all the projects described in the workspace
 * @param tree
 * @param extension
 */
export function getFilesFromWorkspaceProjects(tree: Tree, extension: string) {
  return getFilesInFolderFromWorkspaceProjectsInTree(tree, 'src', extension);
}

/**
 * Get all the typescript files from the src folder for all the projects described in the workspace
 * @param tree
 */
export function getSourceFilesFromWorkspaceProjects(tree: Tree) {
  return getFilesFromWorkspaceProjects(tree, 'ts');
}
