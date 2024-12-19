import {
  FileSystem,
  getFilesTree,
} from '@o3r-training/training-tools';
import {
  type DirectoryNode,
  type FileNode,
  type FileSystemTree,
  type SymlinkNode,
  WebContainer,
  WebContainerProcess,
} from '@webcontainer/api';
import {
  Terminal,
} from '@xterm/xterm';
import {
  BehaviorSubject,
} from 'rxjs';

/**
 * Get the file tree from the path of the File System of the given WebContainer instance
 * @param instance
 * @param excludedFilesOrDirectories
 * @param path
 */
export async function getFilesTreeFromContainer(instance: WebContainer, excludedFilesOrDirectories: string[] = [], path = '/') {
  return await getFilesTree([{
    path,
    isDir: true
  }], instance.fs as FileSystem, excludedFilesOrDirectories);
}

/**
 * Kill a terminal process and clear its content
 * @param terminalSubject
 * @param processSubject
 */
export function killTerminal(terminalSubject: BehaviorSubject<Terminal | null>, processSubject: BehaviorSubject<WebContainerProcess | null>) {
  processSubject.value?.kill();
  processSubject.next(null);
  terminalSubject.value?.clear();
}

/**
 * Open a writable stream on the terminal that can be bound to a process to serve as output
 * @param terminal
 * @param cb
 */
export const createTerminalStream = (terminal: Terminal, cb?: (data: string) => void | Promise<void>) => new WritableStream<string>({
  write: (data) => {
    if (cb) {
      void cb(data);
    }
    terminal.write(data);
  }
});

/**
 * Allow a terminal to serve as an input console for a process
 * @param process
 * @param terminal
 */
export const makeProcessWritable = (process: WebContainerProcess, terminal: Terminal) => {
  const input = process.input.getWriter();
  terminal.onData((data) => input.write(data));
  return input;
};

/**
 * Ensure that node input node is a DirectoryNode
 * @param node
 */
export const isDirectoryNode = (node: DirectoryNode | FileNode | SymlinkNode): node is DirectoryNode => !!(node as DirectoryNode).directory;

/**
 * Ensure that node input node is a FileNode
 * @param node
 */
export const isFileNode = (node: DirectoryNode | FileNode | SymlinkNode): node is FileNode => !!(node as FileNode).file;

/**
 * Deep merge of directories
 * @param dirBase Base directory
 * @param dirOverride Directory to override base
 */
export const mergeDirectories = (dirBase: DirectoryNode, dirOverride: DirectoryNode): DirectoryNode => {
  const merge = structuredClone(dirBase);
  Object.entries(dirOverride.directory).forEach(([path, node]) => {
    const baseNode = merge.directory[path];
    if (!baseNode || (isFileNode(node) && isFileNode(baseNode))) {
      // Not present in base directory
      // Or present in both as file
      merge.directory[path] = node;
    } else if (isDirectoryNode(node) && isDirectoryNode(baseNode)) {
      // Present in both as directory
      merge.directory[path] = mergeDirectories(baseNode, node);
    } else {
      throw new Error('Cannot merge file and directory together');
    }
  });
  return merge;
};

/**
 * Merge a sub file system into another
 * @param fileSystemTree Original file system.
 * @param fileSystemOverride File system that should be merged with the original. Its files take precedence over the original one.
 * @param path Location in mergeFolder where fileSystemOverride should be merged.
 */
export function overrideFileSystemTree(fileSystemTree: FileSystemTree, fileSystemOverride: FileSystemTree, path: string[]): FileSystemTree {
  const key = path.shift() as string;
  const target = fileSystemTree[key] || { directory: {} };
  if (path.length === 0 && isDirectoryNode(target)) {
    // Exploration of file system is done, we can merge the directories
    fileSystemTree[key] = mergeDirectories(target, { directory: fileSystemOverride });
  } else if (isDirectoryNode(target)) {
    fileSystemTree[key] = {
      directory: {
        ...target.directory,
        ...overrideFileSystemTree(target.directory, fileSystemOverride, path)
      }
    };
  } else {
    throw new Error(`Cannot override the file ${key} with a folder`);
  }
  return fileSystemTree;
}

/**
 * Flatten a tree to an array of objects with filePath and content
 * @param tree
 * @param basePath
 */
export const flattenTree = (tree: FileSystemTree, basePath = ''): { filePath: string; content: string }[] => {
  return Object.entries(tree).reduce((out, [path, node]) => {
    if (isDirectoryNode(node)) {
      out.push(...flattenTree(node.directory, `${basePath}/${path}`));
    } else if (isFileNode(node)) {
      out.push({ filePath: `${basePath}/${path}`, content: (node.file as any).contents });
    }
    return out;
  }, [] as { filePath: string; content: string }[]);
};
