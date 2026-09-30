import {
  copyFileSync,
  existsSync,
  linkSync,
  mkdirSync,
  readdirSync,
  readlinkSync,
  statSync,
  symlinkSync,
  utimesSync,
} from 'node:fs';
import * as path from 'node:path';

/** Name of the hidden lockfile written by npm inside the `node_modules` folders */
const NPM_HIDDEN_LOCKFILE = '.package-lock.json';

/**
 * Files that are copied instead of being hard linked:
 * - the npm hidden lockfile is rewritten in place by npm on each install, which would alter the source project through the hard link
 * - native binaries can be locked by running processes (on Windows), which would prevent the removal of the other hard links
 */
const COPIED_FILE_PATTERN = /(?:^\.package-lock\.json|\.(?:node|exe|dll))$/i;

/** Folders at the root of the `node_modules` that are not cloned because they are not part of the installation (tools caches) */
const IGNORED_ROOT_FOLDERS = new Set(['.cache']);

/** Folders never visited while looking for the `node_modules` folders of a project */
const NOT_VISITED_FOLDERS = new Set(['.git', '.angular', '.nx', 'dist']);

/** Result of the {@link cloneNodeModules} operation */
export interface CloneNodeModulesResult {
  /** Paths of the `node_modules` folders cloned, relative to the project root */
  nodeModulesFolders: string[];
  /** Number of files shared with the source project via hard links */
  hardLinkedFiles: number;
  /** Number of files copied (not hard linkable or explicitly excluded from hard linking) */
  copiedFiles: number;
  /** Number of symbolic links (or junctions) re-created */
  symbolicLinks: number;
}

/**
 * Find the `node_modules` folders of a project (root and nested ones, e.g. in npm workspaces), without looking inside them
 * @param projectPath Path to the root of the project
 * @returns Paths of the `node_modules` folders relative to the project root
 */
export function findNodeModulesFolders(projectPath: string): string[] {
  const visit = (relativeFolderPath: string): string[] =>
    readdirSync(path.join(projectPath, relativeFolderPath), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !NOT_VISITED_FOLDERS.has(entry.name))
      .flatMap((entry) => {
        const relativeEntryPath = path.join(relativeFolderPath, entry.name);
        return entry.name === 'node_modules' ? [relativeEntryPath] : visit(relativeEntryPath);
      });
  return visit('');
}

/**
 * Resolve the target of a symbolic link (or Windows junction) and remap it to the destination project when it points inside the source project
 * @param linkPath Path of the symbolic link in the source project
 * @param sourceProjectPath Path to the root of the source project
 * @param destinationProjectPath Path to the root of the destination project
 */
function getRemappedLinkTarget(linkPath: string, sourceProjectPath: string, destinationProjectPath: string) {
  const target = readlinkSync(linkPath).replace(/^\\\\\?\\/, '');
  const absoluteTarget = path.resolve(path.dirname(linkPath), target);
  const relativeToProject = path.relative(sourceProjectPath, absoluteTarget);
  const isInsideProject = !relativeToProject.startsWith('..') && !path.isAbsolute(relativeToProject);
  return {
    absoluteTarget,
    isRelative: !path.isAbsolute(target),
    remappedTarget: isInsideProject ? path.resolve(destinationProjectPath, relativeToProject) : absoluteTarget
  };
}

/**
 * Clone the installed `node_modules` folders (root and nested ones) of a project into another copy of the same project,
 * as a fast and equivalent alternative to a frozen lockfile install:
 * - files are shared via hard links (falling back to a copy when not possible, e.g. across volumes)
 * - symbolic links and Windows junctions (e.g. npm workspaces links) are re-created to target the destination project
 * - files which could be modified in place or locked are copied
 * @param sourceProjectPath Path to the root of the project with the installed dependencies
 * @param destinationProjectPath Path to the root of the project where to clone the dependencies (sources should already be there)
 */
export function cloneNodeModules(sourceProjectPath: string, destinationProjectPath: string): CloneNodeModulesResult {
  const result: CloneNodeModulesResult = { nodeModulesFolders: findNodeModulesFolders(sourceProjectPath), hardLinkedFiles: 0, copiedFiles: 0, symbolicLinks: 0 };
  let canHardLink = true;

  const copyFile = (source: string, destination: string) => {
    copyFileSync(source, destination);
    result.copiedFiles++;
  };

  const cloneFile = (source: string, destination: string, fileName: string) => {
    if (!canHardLink || COPIED_FILE_PATTERN.test(fileName)) {
      return copyFile(source, destination);
    }
    try {
      linkSync(source, destination);
      result.hardLinkedFiles++;
    } catch (err) {
      // Hard links are not possible across volumes: stop trying for the remaining files
      if ((err as { code?: string }).code === 'EXDEV') {
        canHardLink = false;
      }
      copyFile(source, destination);
    }
  };

  const cloneSymbolicLink = (source: string, destination: string) => {
    const { absoluteTarget, isRelative, remappedTarget } = getRemappedLinkTarget(source, sourceProjectPath, destinationProjectPath);
    if (process.platform === 'win32') {
      const isDirectory = statSync(absoluteTarget, { throwIfNoEntry: false })?.isDirectory();
      symlinkSync(remappedTarget, destination, isDirectory ? 'junction' : 'file');
    } else {
      symlinkSync(isRelative ? path.relative(path.dirname(destination), remappedTarget) : remappedTarget, destination);
    }
    result.symbolicLinks++;
  };

  const cloneFolder = (source: string, destination: string, isNodeModulesRoot = false) => {
    mkdirSync(destination, { recursive: true });
    for (const entry of readdirSync(source, { withFileTypes: true })) {
      const sourceEntry = path.join(source, entry.name);
      const destinationEntry = path.join(destination, entry.name);
      if (entry.isSymbolicLink()) {
        cloneSymbolicLink(sourceEntry, destinationEntry);
      } else if (entry.isDirectory()) {
        if (!isNodeModulesRoot || !IGNORED_ROOT_FOLDERS.has(entry.name)) {
          cloneFolder(sourceEntry, destinationEntry);
        }
      } else if (entry.isFile()) {
        cloneFile(sourceEntry, destinationEntry, entry.name);
      }
    }
  };

  for (const nodeModulesFolder of result.nodeModulesFolders) {
    cloneFolder(path.join(sourceProjectPath, nodeModulesFolder), path.join(destinationProjectPath, nodeModulesFolder), true);
    // npm ignores its hidden lockfile when it is older than the folders of the installed packages (which have just been created)
    const hiddenLockfile = path.join(destinationProjectPath, nodeModulesFolder, NPM_HIDDEN_LOCKFILE);
    if (existsSync(hiddenLockfile)) {
      const now = new Date();
      utimesSync(hiddenLockfile, now, now);
    }
  }

  return result;
}
