import {
  inject,
  Injectable,
} from '@angular/core';
import {
  FileSystemTree,
} from '@webcontainer/api';
import {
  MonacoTreeElement,
} from 'ngx-monaco-tree';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  share,
} from 'rxjs';
import {
  convertTreeRec,
} from '../../helpers/monaco-tree.helper';
import {
  WebContainerRunner,
} from './webcontainer-runner';
import {
  getFilesTreeFromContainer,
} from './webcontainer.helpers';

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
      const parent = filePath.replace(/^([^/])/, '/$1').replace(/\/[^/]*$/, '');
      const fileEntries = await instance.fs.readdir(parent, { encoding: 'utf8', withFileTypes: true });
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

    return getFilesTreeFromContainer(instance, EXCLUDED_FILES_OR_DIRECTORY);
  }

  /**
   * Retrieve all typescript declaration files from web-container
   * @param project
   * @param maxDepth
   * @param path
   */
  public async getDeclarationTypes(project: string, maxDepth = 20, path = 'node_modules'): Promise<{ filePath: string; content: string }[]> {
    // TODO read that from project devDependencies?
    const dependenciesWhiteList = /(^|\/)(@ama-sdk|@angular|@o3r|rxjs|@types)(\/|$)/;
    const dependenciesBlackList = /(^|\/)(node_modules|docs?|locales?|bin|dist|templates|@angular-devkit|compiler(-cli)?|schematics?|.*eslint.*|cli)(\/|$)/;
    const instance = await this.runner.instancePromise;
    const basePath = `${project}/${path}`;
    const dependencies = await instance.fs.readdir(basePath, { encoding: 'utf8', withFileTypes: true });
    return (await Promise.all(dependencies.map(async (dirEntry) => {
      if (dirEntry.isDirectory() && !dependenciesBlackList.test(dirEntry.name) && (dependenciesWhiteList.test(dirEntry.name) || dependenciesWhiteList.test(path))) {
        const files = await instance.fs.readdir(`${basePath}/${dirEntry.name}`, { encoding: 'utf8', withFileTypes: true });
        const indexFiles = await Promise.all(files.filter((entry) => entry.isFile() && entry.name.endsWith('.d.ts')).map(async (indexFile) => ({
          filePath: `file:///${path}/${dirEntry.name}/${indexFile.name}`,
          content: await instance.fs.readFile(`${basePath}/${dirEntry.name}/${indexFile.name}`, 'utf8')
        })));
        return [
          ...indexFiles,
          ...(maxDepth > 1 ? await this.getDeclarationTypes(project, maxDepth - 1, `${path}/${dirEntry.name}`) : [])
        ];
      }
      return [];
    }))).flat();
  }
}
