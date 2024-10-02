import {inject, Injectable} from '@angular/core';
import {FileSystemTree} from '@webcontainer/api';
import {MonacoTreeElement} from 'ngx-monaco-tree';
import {BehaviorSubject, distinctUntilChanged, map, share} from 'rxjs';
import {WebContainerRunner} from './webcontainer-runner';
import {getFilesTreeFromContainer} from './webcontainer.helpers';
import {convertTreeRec} from '../../helpers/monaco-tree.helper';

/** List of files or directories to exclude from the file tree */
const EXCLUDED_FILES_OR_DIRECTORY = ['node_modules', '.angular', '.vscode'];

@Injectable({
  providedIn: 'root'
})
export class WebContainerService {
  public readonly runner = inject(WebContainerRunner);
  private readonly monacoTree = new BehaviorSubject<MonacoTreeElement[]>([]);

  public monacoTree$ = this.monacoTree.pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    share()
  );
  public isReady$ = this.monacoTree$.pipe(
    map((tree) => tree.length > 0)
  );

  /**
   * Get the Monaco file tree from the given root path
   * @param rootPath
   */
  private async getMonacoTree(rootPath: string): Promise<MonacoTreeElement[]> {
    const instance = await this.runner.instancePromise;
    const tree = await getFilesTreeFromContainer(instance, EXCLUDED_FILES_OR_DIRECTORY, rootPath);
    return Object.entries(tree).map(([path, node]) => convertTreeRec(path, node));
  }

  /**
   * Load a new project: mount the files in the dedicated folder, update the monaco tree and watch the folder updates and
   * run the initialization commands
   * @param files
   * @param commands
   * @param exerciseName
   */
  public async loadProject(files: FileSystemTree, commands: string[], exerciseName: string) {
    this.monacoTree.next([]);
    this.runner.registerTreeUpdateCallback(async () => {
      const tree = await this.getMonacoTree('./');
      this.monacoTree.next(tree);
    });
    const filesToLoad = await this.doesFolderExist(exerciseName) ? null : files;
    return this.runner.runProject(filesToLoad, commands, exerciseName);
  }

  /**
   * Writes a file with the provided content to the given path
   * @param file
   * @param content
   */
  public async writeFile(file: string, content: string) {
    const instance = await this.runner.instancePromise;
    return instance.fs.writeFile(file, content);
  }

  /**
   * Reads the file at the given path
   * @param file
   */
  public async readFile(file: string): Promise<string> {
    const instance = await this.runner.instancePromise;
    return instance.fs.readFile(file, 'utf8');
  }

  /**
   * Determine if the file path entry is a file
   * @param filePath - absolute path in the file system (relative path not supported)
   */
  public async isFile(filePath: string) {
    try {
      const instance = await this.runner.instancePromise;
      const parent = filePath.replace(/^([^/])/, '/$1').replace(/[/][^/]*$/, '');
      const fileEntries = await instance.fs.readdir(parent, {encoding: 'utf8', withFileTypes: true});
      const fileEntry = fileEntries.find((file) => filePath.split('/').pop() === file.name);
      return !!fileEntry?.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Checks if the folder exists at the root of the WebContainer instance
   * @param folderName
   */
  public async doesFolderExist(folderName: string) {
    try {
      const instance = await this.runner.instancePromise;
      await instance.fs.readdir(folderName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the file tree of the current instance (for debugging purposes)
   */
  public async getTree() {
    const instance = await this.runner.instancePromise;
    // eslint-disable-next-line no-console
    return getFilesTreeFromContainer(instance, EXCLUDED_FILES_OR_DIRECTORY);
  }
}
