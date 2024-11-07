import type {
  BufferEncoding,
  DirEnt,
  FileSystemTree
} from '@webcontainer/api';

/**
 * Function to read a directory in the file system
 * @param root Path of the directory
 * @param options Options to read the directory (the encoding of the directory and whether to return an array of Dirent objects)
 */
export type ReadDirFn = (root: string, options: {
  encoding?: BufferEncoding | null | undefined;
  withFileTypes?: boolean;
}) => Promise<DirEnt<string>[]>;

/**
 * Function to read a file in the file system
 * @param root Path of the file
 * @param encoding Encoding of the file
 */
export type ReadFileFn = (root: string, encoding?: BufferEncoding | null) => Promise<string>;

/**
 * File system operations
 */
export type FileSystem = {
  /** Reads a given directory and returns its files and directories */
  readdir: ReadDirFn;
  /** Reads a given file */
  readFile: ReadFileFn;
};

/**
 * Reads a given directory and returns the files and their corresponding contents
 * @param entry
 * @param path
 * @param fileSystem
 * @param exclusionList
 */
const readDirRec = async (entry: DirEnt<string>, path: string, fileSystem: FileSystem, exclusionList: string[] = []):
Promise<FileSystemTree | undefined> => {
  if (exclusionList.includes(entry.name)) {
    return;
  }
  const entryPath = path + '/' + entry.name;
  if (entry.isDirectory()) {
    const dirEntries = await fileSystem.readdir(entryPath, { encoding: 'utf8', withFileTypes: true });
    const tree = { [entry.name]: { directory: {} } };
    for (const subEntry of dirEntries) {
      tree[entry.name].directory = {
        ...tree[entry.name].directory,
        ...(await readDirRec(subEntry, entryPath, fileSystem, exclusionList))
      };
    }
    return tree;
  }
  return {
    [entry.name]: {
      file: { contents: await fileSystem.readFile(entryPath, 'utf8') }
    }
  };
};

/**
 * Get the file system tree from the given file system taking into account the list of files/directories to exclude
 * @param files
 * @param fileSystem
 * @param exclusionList
 */
export const getFilesTree = async (files: { isDir: boolean; path: string }[], fileSystem: FileSystem, exclusionList: string[] = []) => {
  const tree: FileSystemTree = {};
  for (const { isDir, path } of files) {
    if (isDir) {
      const dirEntries = await fileSystem.readdir(path, { encoding: 'utf8', withFileTypes: true });
      for (const entry of dirEntries) {
        const subTree = await readDirRec(entry, path, fileSystem, exclusionList);
        if (subTree) {
          tree[entry.name] = subTree[entry.name];
        }
      }
    } else {
      const name = path.split('/').pop();
      if (name) {
        tree[name] = {
          file: { contents: await fileSystem.readFile(path, 'utf8') }
        };
      }
    }
  }
  return tree;
};
