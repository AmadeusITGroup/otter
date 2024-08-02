import type {BufferEncoding, DirEnt, FileSystemTree} from '@webcontainer/api';

export type ReadDirFn = (root: string, options: {
  encoding?: BufferEncoding | null | undefined;
  recursive?: boolean | undefined;
  withFileTypes?: boolean;
}) => Promise<DirEnt<string>[]>

export type ReadFileFn = (root: string, encoding?: BufferEncoding | null | undefined) => Promise<string>;

export type FileSystem = {
  readDirFn: ReadDirFn;
  readFileFn: ReadFileFn;
};

export const getFilesTree = async (path: string, fileSystem: FileSystem) => {
  const tree: FileSystemTree = {};
  const dirEntries = await fileSystem.readDirFn(path, {encoding: 'utf-8', withFileTypes: true});
  for (const entry of dirEntries) {
    const subTree = await readDirRec(entry, path, fileSystem);
    if (subTree) {
      tree[entry.name] = subTree[entry.name];
    }
  }
  return tree;
}

const readDirRec = async (entry: DirEnt<string>, path: string, fileSystem: FileSystem, exclusionList: string[] = []):
  Promise<FileSystemTree | undefined> => {
  const entryPath = path + '/' + entry.name;
  if (entry.isDirectory()) {
    if (exclusionList.includes(entry.name)) {
      return;
    }
    const dirEntries = await fileSystem.readDirFn(entryPath, {encoding: 'utf-8', withFileTypes: true});
    const tree = {[entry.name]: {directory: {}}};
    for (const subEntry of dirEntries) {
      tree[entry.name].directory = {
        ...tree[entry.name].directory,
        ...(await readDirRec(subEntry, entryPath, fileSystem))
      };
    }
    return tree;
  }
  return {
    [entry.name]: {
      file: {contents: await fileSystem.readFileFn(entryPath, 'utf-8')}
    }
  };
}
