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

const createHtmlStream = (div: HTMLDivElement, cb?: (data: string) => void | Promise<void>) => new WritableStream({
  write(data) {
    if (cb) {
      void cb(data);
    }
    div.innerText = `${data}
${div.innerText}`;
  }
});

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

  private async runCommand(command: string, terminal: Terminal | HTMLDivElement) {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }
    const process = await this.instance.spawn('npm', command.split(' '));
    if (Object.hasOwn(terminal, 'parser')) {
      void process.output.pipeTo(createTerminalStream(terminal as Terminal));
    } else {
      void process.output.pipeTo(createHtmlStream(terminal as HTMLDivElement));
    }
    return process;
  }

  // private async installThenRun(iframe: HTMLIFrameElement, terminal: Terminal) {
  //   const installProcess = await this.installDeps(terminal);
  //   const exitCode = await installProcess.exit;
  //   if (exitCode !== 0) {
  //     throw new Error('Installation failed!');
  //   }
  //   void this.runApp(iframe, terminal);
  // }

  // public async launchProject(iframe: HTMLIFrameElement, terminal: Terminal, files: FileSystemTree) {
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
      const tree = await this.getMonacoTree();
      this.monacoTree.next(tree);
    });
  }

  public async runCommands(commands: string[] = [], iframe: HTMLIFrameElement, terminal: Terminal | HTMLDivElement) {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }
    if (this.currentProcess) {
      this.currentProcess.kill();
      iframe.src = '';
      this.currentProcess = null;
    }
    for (const command of commands) {
      this.currentProcess = await this.runCommand(command, terminal);
    }
    this.instance.on('server-ready', (_port: number, url: string) => {
      iframe.src = url;
    });
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

  public async getFilesTreeFromContainer() {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }
    return await getFilesTree([{path: '/', isDir: true}], this.instance.fs as FileSystem, EXCLUDED_FILES_OR_DIRECTORY);
  }

  public destroyInstance() {
    if (this.instance) {
      this.instance.teardown();
      this.instance = null;
      this.monacoTree.next([]);
    }
  }
}
