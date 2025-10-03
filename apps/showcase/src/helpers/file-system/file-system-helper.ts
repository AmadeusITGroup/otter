import {
  DirectoryNode,
  FileNode,
  FileSystemTree,
  SymlinkNode,
} from '@webcontainer/api';

/** Resources to get file content */
export type TrainingResource = {
  /** Resource path */
  path: string;
  /** Resource content */
  content: string;
};

/**
 * Check a resource can be cast as a TrainingResource
 * @param resource
 */
export const isTrainingResource = (resource: any): resource is TrainingResource => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- needed to check object type to be able to cast it
  return typeof resource?.content === 'string' && typeof resource?.path === 'string';
};

/**
 * Generate a file system tree composed of the deep merge of all the resources passed in parameters
 * @param resources Sorted list of path and content to load. If a file is defined several time, the last occurrence
 * overrides the others
 */
export function getFilesContent(resources: TrainingResource[]) {
  return (resources.reduce((fileSystemTree: FileSystemTree, resource) => {
    const parsedPath = `./${resource.path}`.split('/').filter((pathEl) => !!pathEl);
    overrideFileSystemTree(fileSystemTree, (JSON.parse(resource.content) as { fileSystemTree: FileSystemTree }).fileSystemTree, parsedPath);
    return fileSystemTree;
  }, { '.': { directory: {} } } as FileSystemTree)['.'] as DirectoryNode).directory;
}

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
  let target = fileSystemTree[key];
  // Skip '.' subfolder, only root can be '.'
  if (!target && key === '.') {
    if (path.length > 0) {
      return overrideFileSystemTree(fileSystemTree, fileSystemOverride, path);
    }
    return mergeDirectories({ directory: fileSystemTree }, { directory: fileSystemOverride }).directory;
  }
  // Create or merge subfolder $key
  target ||= { directory: {} };
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
