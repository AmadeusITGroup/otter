import {Injectable} from '@angular/core';
import {FileSystem, getFilesTree} from '@o3r-training/tools';
import {DirectoryNode, FileNode, FileSystemTree, WebContainer} from '@webcontainer/api';
import {BehaviorSubject, distinctUntilChanged, map} from 'rxjs';
import {MonacoTreeElement} from '../../components';
import {WebContainerRunner} from './webcontainer-runner';

class WebContainerNotInitialized extends Error {
  constructor() {
    super('WebContainer not initialized');
  }
}

const EXCLUDED_FILES_OR_DIRECTORY = ['node_modules', '.angular', '.vscode'];

function convertTreeRec(path: string, node: DirectoryNode | FileNode): MonacoTreeElement {
  return {
    name: path,
    content: (node as DirectoryNode).directory
      ? Object.entries((node as DirectoryNode).directory)
        .map(([p, n]) => convertTreeRec(p, n))
      : undefined
  };
}

@Injectable({
  providedIn: 'root'
})
export class WebcontainerService {
  public readonly runner = new WebContainerRunner();
  private readonly monacoTree = new BehaviorSubject<MonacoTreeElement[]>([]);

  public monacoTree$ = this.monacoTree.pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );
  public isReady$ = this.monacoTree$.pipe(
    map((tree) => tree.length > 0)
  );

  private async getMonacoTree(): Promise<MonacoTreeElement[]> {
    const instance = this.runner.instance();
    if (!instance) {
      throw new WebContainerNotInitialized();
    }
    const tree = await this.getFilesTreeFromContainer(instance);
    return Object.entries(tree)
      .reduce(
        (acc: MonacoTreeElement[], [path, node]) =>
          acc.concat(convertTreeRec(path, node)),
        []
      );
  }

  private async getFilesTreeFromContainer(instance: WebContainer) {
    return await getFilesTree([{
      path: '/',
      isDir: true
    }], instance.fs as FileSystem, EXCLUDED_FILES_OR_DIRECTORY);
  }

  public async loadProject(files: FileSystemTree, commands: string[]) {
    this.monacoTree.next([]);
    await this.runner.runProject(files, commands, async () => {
      const tree = await this.getMonacoTree();
      this.monacoTree.next(tree);
    });
    this.monacoTree.next(await this.getMonacoTree());
  }

  public writeFile(file: string, content: string) {
    const instance = this.runner.instance();
    if (!instance) {
      throw new WebContainerNotInitialized();
    }

    return instance.fs.writeFile(file, content);
  }

  public readFile(file: string): Promise<string> {
    const instance = this.runner.instance();
    if (!instance) {
      throw new WebContainerNotInitialized();
    }

    return instance.fs.readFile(file, 'utf-8');
  }

  public async isFile(filePath: string) {
    const instance = this.runner.instance();
    if (!instance) {
      throw new WebContainerNotInitialized();
    }
    const parent = `${!filePath.startsWith('/') ? '/' : ''}${filePath}`
      .split('/')
      .slice(0, -1)
      .join('/');
    const fileEntries = await instance.fs.readdir(parent, {encoding: 'utf-8', withFileTypes: true});
    const fileEntry = fileEntries.find((file) => filePath.split('/').pop() === file.name);
    return !!fileEntry?.isFile();
  }


  public async logTree() {
    const instance = this.runner.instance();
    if (!instance) {
      throw new WebContainerNotInitialized();
    }
    console.log(await this.getFilesTreeFromContainer(instance));
  }
}
