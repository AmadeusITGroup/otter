import {Injectable} from '@angular/core';
import {FileSystem, getFilesTree} from '@o3r-training/tools';
import {DirectoryNode, FileNode, FileSystemTree, WebContainer, WebContainerProcess} from '@webcontainer/api';
import {Terminal} from '@xterm/xterm';
import {BehaviorSubject, distinctUntilChanged} from 'rxjs';
import {MonacoTreeElement} from '../../components';

class WebContainerNotInitialized extends Error {
  constructor() {
    super('WebContainer not initialized');
  }
}

const EXCLUDED_FILES_OR_DIRECTORY = ['node_modules', '.angular', '.vscode'];

const createTerminalStream = (terminal: Terminal, cb?: (data: string) => void | Promise<void>) => new WritableStream({
  write(data) {
    if (cb) {
      void cb(data);
    }
    terminal.write(data);
  }
});

// const createHtmlStream = (div: HTMLDivElement, cb?: (data: string) => void | Promise<void>) => new WritableStream({
//   write(data) {
//     if (cb) {
//       void cb(data);
//     }
//     div.innerText = `${data}
// ${div.innerText}`;
//   }
// });

const makeProcessWritable = (process: WebContainerProcess, terminal: Terminal) => {
  const input = process.input.getWriter();
  terminal.onData((data) => input.write(data));
  return input;
};

@Injectable({
  providedIn: 'root'
})
export class WebcontainerService {
  private instance: WebContainer | null = null;
  private readonly monacoTree = new BehaviorSubject<MonacoTreeElement[]>([]);
  private currentProcess: WebContainerProcess | null = null;

  public monacoTree$ = this.monacoTree.pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  private convertTreeRec(path: string, node: DirectoryNode | FileNode): MonacoTreeElement {
    return {
      name: path,
      content: (node as DirectoryNode).directory
        ? Object.entries((node as DirectoryNode).directory)
          .map(([p, n]) => this.convertTreeRec(p, n))
        : undefined
    };
  }

  private async getMonacoTree(): Promise<MonacoTreeElement[]> {
    const tree = await this.getFilesTreeFromContainer();
    return Object.entries(tree)
      .reduce(
        (acc: MonacoTreeElement[], [path, node]) =>
          acc.concat(this.convertTreeRec(path, node)),
        []
      );
  }

  private async runCommand(command: string, terminal: Terminal) {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }
    const commandElements = command.split(' ');
    const process = await this.instance.spawn(commandElements[0], commandElements.slice(1));
    void process.output.pipeTo(createTerminalStream(terminal as Terminal));
    return process;
  }

  public async getFilesTreeFromContainer() {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }
    return await getFilesTree([{path: '/', isDir: true}], this.instance.fs as FileSystem, EXCLUDED_FILES_OR_DIRECTORY);
  }

  public async loadProject(files: FileSystemTree) {
    if (this.instance) {
      this.destroyInstance();
    }
    this.instance = await WebContainer.boot();
    // eslint-disable-next-line no-console
    this.instance.on('error', console.error);
    await this.instance.mount(files);
    this.monacoTree.next(await this.getMonacoTree());
    this.instance.fs.watch('/', {encoding: 'utf-8'}, async () => {
      console.log('update tree');
      const tree = await this.getMonacoTree();
      this.monacoTree.next(tree);
    });
  }

  public async runCommands(commands: string[] = [], iframe: HTMLIFrameElement, terminal: Terminal) {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }
    iframe.src = '';
    this.instance.on('server-ready', (_port: number, url: string) => {
      iframe.src = url;
    });
    for (const command of commands) {
      this.currentProcess = await this.runCommand(command, terminal);
      const exitCode = await this.currentProcess.exit;
      if (exitCode !== 0) {
        throw new Error(`Command ${command} failed! with ${exitCode}`);
      }
    }
  }

  public async writeFile(file: string, content: string) {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }

    return this.instance.fs.writeFile(file, content);
  }

  public async readFile(file: string): Promise<string> {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }

    return this.instance.fs.readFile(file, 'utf-8');
  }

  public async isFile(filePath: string) {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }
    const parent = `${!filePath.startsWith('/') ? '/' : ''}${filePath}`
      .split('/')
      .slice(0, -1)
      .join('/');
    const fileEntries = await this.instance.fs.readdir(parent, {encoding: 'utf-8', withFileTypes: true});
    const fileEntry = fileEntries.find((file) => filePath.split('/').pop() === file.name);
    return !!fileEntry?.isFile();
  }

  public async startShell(terminal: Terminal) {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }
    const shellProcess = await this.instance.spawn('jsh');
    const cb = (async (data: string) => {
      if (['CREATE', 'UPDATE', 'RENAME', 'DELETE'].some((action) => data.includes(action))) {
        const tree = await this.getMonacoTree();
        this.monacoTree.next(tree);
      }
    });
    void shellProcess.output.pipeTo(createTerminalStream(terminal, cb));
    makeProcessWritable(shellProcess, terminal);

    return shellProcess;
  }

  public async logTree() {
    console.log(await this.getMonacoTree());
  }

  public killCurrentProcess() {
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = null;
    }
  }

  public isReady() {
    return !!this.instance;
  }

  public destroyInstance() {
    if (this.instance) {
      this.instance.teardown();
      this.instance = null;
      this.monacoTree.next([]);
    }
  }
}
