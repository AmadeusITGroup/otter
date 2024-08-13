import {computed, effect, Injectable, Signal, signal, WritableSignal} from '@angular/core';
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

const makeProcessWritable = (process: WebContainerProcess, terminal: Terminal) => {
  const input = process.input.getWriter();
  terminal.onData((data) => input.write(data));
  return input;
};

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
  private readonly instance: WritableSignal<WebContainer | null> = signal(null);
  private readonly commandsQueued: WritableSignal<string[]> = signal([]);
  private readonly commandOnRun: Signal<string | undefined> = computed(() => this.commandsQueued()[0]);
  private readonly iframe: WritableSignal<HTMLIFrameElement | null> = signal(null);
  private readonly shell: {
    terminal: WritableSignal<Terminal | null>;
    process: WritableSignal<WebContainerProcess | null>;
  } = {
      terminal: signal(null),
      // TODO clear writingStream:
      process: signal(null)
    };
  private readonly console: {
    terminal: WritableSignal<Terminal | null>;
    process: WritableSignal<WebContainerProcess | null>;
  } = {
      terminal: signal(null),
      process: signal(null)
    };

  // TODO migrate to Signal ?
  private readonly monacoTree = new BehaviorSubject<MonacoTreeElement[]>([]);

  public monacoTree$ = this.monacoTree.pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  constructor() {
    effect(() => {
      const instance = this.instance();
      const command = this.commandOnRun();
      if (instance && command) {
        const commandElements = command.split(' ');
        void instance.spawn(commandElements[0], commandElements.slice(1)).then(
          async (process) => {
            this.console.process.set(process);
            const exitCode = await process.exit;
            if (exitCode !== 0) {
              throw new Error(`Command ${command} failed! with ${exitCode}`);
            }
            this.commandsQueued.set(this.commandsQueued().slice(1));
          }
        );
      }
    });
    effect(() => {
      const instanceSignal = this.instance();
      const iframeSignal = this.iframe();
      if (instanceSignal && iframeSignal) {
        instanceSignal.on('server-ready', (_port: number, url: string) => {
          iframeSignal.src = url;
        });
      }
    });
    effect(() => {
      const consoleProcessSignal = this.console.process();
      const consoleTerminalSignal = this.console.terminal();
      if (consoleProcessSignal && consoleTerminalSignal) {
        void consoleProcessSignal.output.pipeTo(createTerminalStream(consoleTerminalSignal));
        // TODO Attention aux multiples streams ouverts
      }
    });
    effect(async () => {
      const terminalSignal = this.shell.terminal();
      const instanceSignal = this.instance();
      if (terminalSignal && !this.shell.process() && instanceSignal) {
        this.shell.process.set(await this.startShell(terminalSignal, instanceSignal));
      }
    });
  }

  private async startShell(terminal: Terminal, instance: WebContainer) {
    const shellProcess = await instance.spawn('jsh');
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

  private async getMonacoTree(): Promise<MonacoTreeElement[]> {
    const instance = this.instance();
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

  private destroyInstance() {
    const instance = this.instance();
    if (instance) {
      instance.teardown();
      this.instance.set(null);
      this.monacoTree.next([]);
    }
  }

  public isReady() {
    return !!this.instance();
  }

  public async loadProject(files: FileSystemTree) {
    if (this.instance()) {
      this.destroyInstance();
    }
    const instance = await WebContainer.boot();
    // eslint-disable-next-line no-console
    this.instance.set(instance);
    instance.on('error', console.error);
    await instance.mount(files);
    this.monacoTree.next(await this.getMonacoTree());
    instance.fs.watch('/', {encoding: 'utf-8'}, async () => {
      console.log('update tree');
      const tree = await this.getMonacoTree();
      this.monacoTree.next(tree);
    });
  }

  public writeFile(file: string, content: string) {
    if (!this.instance()) {
      throw new WebContainerNotInitialized();
    }

    return this.instance()!.fs.writeFile(file, content);
  }

  public readFile(file: string): Promise<string> {
    if (!this.instance()) {
      throw new WebContainerNotInitialized();
    }

    return this.instance()!.fs.readFile(file, 'utf-8');
  }

  public async isFile(filePath: string) {
    if (!this.instance()) {
      throw new WebContainerNotInitialized();
    }
    const parent = `${!filePath.startsWith('/') ? '/' : ''}${filePath}`
      .split('/')
      .slice(0, -1)
      .join('/');
    const fileEntries = await this.instance()!.fs.readdir(parent, {encoding: 'utf-8', withFileTypes: true});
    const fileEntry = fileEntries.find((file) => filePath.split('/').pop() === file.name);
    return !!fileEntry?.isFile();
  }

  public queueCommands(commands: string[] = []) {
    const shellProcess = this.shell.process();
    if (shellProcess) {
      shellProcess.kill();
    }
    this.commandsQueued.set(commands);
  }

  public registerShell(terminal: Terminal) {
    this.shell.terminal.set(terminal);
  }

  public registerConsole(terminal: Terminal) {
    this.console.terminal.set(terminal);
  }

  public registerIframe(iframe: HTMLIFrameElement) {
    const previousIframe = this.iframe();
    if (previousIframe) {
      previousIframe.src = '';
    }
    this.iframe.set(iframe);
  }

  public async logTree() {
    const instance = this.instance();
    if (!instance) {
      throw new WebContainerNotInitialized();
    }
    console.log(await this.getFilesTreeFromContainer(instance));
  }

  public disposeShell() {
    const shellProcess = this.shell.process();
    if (shellProcess) {
      shellProcess.kill();
    }
    this.shell.process.set(null);
    this.shell.terminal.set(null);
  }

  public disposeConsole() {
    const consoleProcess = this.console.process();
    if (consoleProcess) {
      consoleProcess.kill();
    }
    this.console.process.set(null);
    this.console.terminal.set(null);
  }

  public clearContainer() {
    this.disposeShell();
    this.disposeConsole();
    this.destroyInstance();
  }
}
