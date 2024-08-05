import {Injectable} from '@angular/core';
import {DirectoryNode, FileNode, FileSystemTree, WebContainer, WebContainerProcess} from '@webcontainer/api';
import {Terminal} from '@xterm/xterm';
import {BehaviorSubject, distinctUntilChanged} from 'rxjs';
import { MonacoTreeElement } from '../../components';
import { FileSystem, getFilesTree } from '@o3r-training/tools';

class WebContainerNotInitialized extends Error {
  constructor() {
    super('WebContainer not initialized');
  }
}

// const EXCLUDED_FILES_OR_DIRECTORY = ['node_modules', '.angular', '.vscode'];

const createTerminalStream = (terminal: Terminal, cb?: (data: string) => void | Promise<void>) => new WritableStream({
  write(data) {
    if (cb) {
      void cb(data);
    }
    terminal.write(data);
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

  // private async installDeps(terminal: Terminal) {
  //   if (!this.instance) {
  //     throw new WebContainerNotInitialized();
  //   }
  //   const installProcess = await this.instance.spawn('npm', ['install']);
  //   void installProcess.output.pipeTo(createTerminalStream(terminal));
  //   return installProcess;
  // }
  //
  // private async runApp(iframe: HTMLIFrameElement, terminal: Terminal) {
  //   if (!this.instance) {
  //     throw new WebContainerNotInitialized();
  //   }
  //   const shellProcess = await this.instance.spawn('npm', ['run', 'ng', 'run', 'tuto:serve']);
  //   void shellProcess.output.pipeTo(createTerminalStream(terminal));
  //   this.instance.on('server-ready', (_port: number, url: string) => {
  //     iframe.src = url;
  //   });
  //
  //   return shellProcess;
  // }

  // private async installThenRun(iframe: HTMLIFrameElement, terminal: Terminal) {
  //   const installProcess = await this.installDeps(terminal);
  //   const exitCode = await installProcess.exit;
  //   if (exitCode !== 0) {
  //     throw new Error('Installation failed!');
  //   }
  //   void this.runApp(iframe, terminal);
  // }

  // public async launchProject(iframe: HTMLIFrameElement, terminal: Terminal, files: FileSystemTree) {
  public async launchProject(_iframe: HTMLIFrameElement, _terminal: Terminal, files: FileSystemTree) {
    if (this.instance) {
      this.destroyInstance();
    }
    this.instance = await WebContainer.boot();
    // eslint-disable-next-line no-console
    this.instance.on('error', console.error);
    await this.instance.mount(files);
    this.instance.fs.watch('/', {encoding: 'utf-8'}, async () => {
      const tree = await this.getMonacoTree();
      this.monacoTree.next(tree);
    });
    // TODO fix and only run in some mode
    // void this.installThenRun(iframe, terminal);
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

  // Delete this function ?
  public async consoleFiles() {
    console.log(await this.getFilesTreeFromContainer());
  }

  public async getFilesTreeFromContainer() {
    if (!this.instance) {
      throw new WebContainerNotInitialized();
    }
    return await getFilesTree('/', {readFileFn: this.instance.fs.readFile, readDirFn: this.instance.fs.readdir} as FileSystem);
  }

  public destroyInstance() {
    if (this.instance) {
      this.instance.teardown();
    }
  }
}
