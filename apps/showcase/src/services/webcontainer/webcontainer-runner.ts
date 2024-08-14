import {computed, effect, Signal, signal, WritableSignal} from '@angular/core';
import {FileSystemTree, WebContainer, WebContainerProcess} from '@webcontainer/api';
import {Terminal} from '@xterm/xterm';

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

export class WebContainerRunner {
  public readonly instance: WritableSignal<WebContainer | null> = signal(null);
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

  private killTerminal(terminalSignal: WritableSignal<Terminal | null>, processSignal: WritableSignal<WebContainerProcess | null>) {
    const terminal = terminalSignal();
    const process = processSignal();
    if (process) {
      process.kill();
      processSignal.set(null);
    }
    if (terminal) {
      terminal.clear();
    }
  }

  private async startShell(terminal: Terminal, instance: WebContainer) {
    const shellProcess = await instance.spawn('jsh');
    // TODO check if working without cb
    void shellProcess.output.pipeTo(createTerminalStream(terminal));
    makeProcessWritable(shellProcess, terminal);
    return shellProcess;
  }

  public async runProject(files: FileSystemTree, commands: string[], onTreeUpdate: () => {}) {
    if (this.instance()) {
      this.clearContainer();
    }
    this.commandsQueued.set(commands);
    const instance = await WebContainer.boot();
    // eslint-disable-next-line no-console
    this.instance.set(instance);
    instance.on('error', console.error);
    instance.fs.watch('/', {encoding: 'utf-8'}, onTreeUpdate);
    await this.instance()!.mount(files);
  }

  public clearContainer() {
    this.killTerminal(this.shell.terminal, this.shell.process);
    this.killTerminal(this.console.terminal, this.console.process);
    const iframe = this.iframe();
    if (iframe) {
      iframe.src = '';
    }
    const instance = this.instance();
    if (instance) {
      instance.teardown();
      this.instance.set(null);
    }
  }

  public registerShell(terminal: Terminal) {
    this.shell.terminal.set(terminal);
  }

  public registerConsole(terminal: Terminal) {
    this.console.terminal.set(terminal);
  }

  public setIframe(iframe: HTMLIFrameElement | null) {
    const previousIframe = this.iframe();
    if (previousIframe) {
      previousIframe.src = '';
    }
    this.iframe.set(iframe);
  }

  public disposeShell() {
    this.killTerminal(this.shell.terminal, this.shell.process);
    this.shell.terminal.set(null);
  }

  public disposeConsole() {
    this.killTerminal(this.shell.terminal, this.shell.process);
    this.console.terminal.set(null);
  }
}
