import type { BufferEncoding, DirEnt, FileSystemTree } from '@webcontainer/api';

export type ReadDirFn = (root: string, options: {
  encoding?: BufferEncoding | null | undefined;
  recursive?: boolean | undefined;
  withFileTypes?: boolean;
}) => Promise<DirEnt<string>[]>;

export type ReadFileFn = (root: string, encoding?: BufferEncoding | null | undefined) => Promise<string>;

export type FileSystem = {
  readdir: ReadDirFn;
  readFile: ReadFileFn;
};

const readDirRec = async (entry: DirEnt<string>, path: string, fileSystem: FileSystem, exclusionList: string[] = []):
  Promise<FileSystemTree | undefined> => {
  const entryPath = path + '/' + entry.name;
  if (exclusionList.includes(entry.name)) {
    return;
  }
  if (entry.isDirectory()) {
    const dirEntries = await fileSystem.readdir(entryPath, { encoding: 'utf-8', withFileTypes: true });
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
      file: { contents: await fileSystem.readFile(entryPath, 'utf-8') }
    }
  };
};

// TODO Add exclusion list
export const getFilesTree = async (files: {isDir: boolean, path: string}[], fileSystem: FileSystem, exclusionList: string[] = []) => {
  const tree: FileSystemTree = {};
  for (const {isDir, path} of files) {
    if (isDir) {
      const dirEntries = await fileSystem.readdir(path, { encoding: 'utf-8', withFileTypes: true });
      for (const entry of dirEntries) {
        const subTree = await readDirRec(entry, path, fileSystem, exclusionList);
        if (subTree) {
          tree[entry.name] = subTree[entry.name];
        }
      }
    } else {
      const name = path.match(/([^\\/]+)$/g)?.[0];
      if (name) {
        tree[name] = {
          file: { contents: await fileSystem.readFile(path, 'utf-8') }
        };
      }
    }
  }
  return tree;
};
