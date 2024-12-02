import {
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  type FileSystemTree,
  type IFSWatcher,
  WebContainer,
  type WebContainerProcess,
} from '@webcontainer/api';
import {
  Terminal,
} from '@xterm/xterm';
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  distinctUntilChanged,
  filter,
  from,
  fromEvent,
  map,
  Observable,
  of,
} from 'rxjs';
import {
  skip,
  switchMap,
  take,
  timeout,
} from 'rxjs/operators';
import {
  createTerminalStream,
  killTerminal,
  makeProcessWritable,
} from './webcontainer.helpers';

@Injectable({
  providedIn: 'root'
})
export class WebContainerRunner {
  /**
   * WebContainer instance which is available after the boot of the WebContainer
   */
  public readonly instancePromise: Promise<WebContainer>;
  private readonly commands = new BehaviorSubject<{ queue: string[]; cwd: string }>({ queue: [], cwd: '' });
  private readonly commandOnRun$: Observable<{ command: string; cwd: string } | undefined> = this.commands.pipe(
    map((commands) => (
      commands.queue.length > 0 ? { command: commands.queue[0], cwd: commands.cwd } : undefined
    ))
  );

  private readonly iframe = new BehaviorSubject<HTMLIFrameElement | null>(null);
  private readonly shell = {
    terminal: new BehaviorSubject<Terminal | null>(null),
    process: new BehaviorSubject<WebContainerProcess | null>(null),
    writer: new BehaviorSubject<WritableStreamDefaultWriter | null>(null),
    cwd: new BehaviorSubject<string | null>(null)
  };

  private readonly commandOutput = {
    terminal: new BehaviorSubject<Terminal | null>(null),
    process: new BehaviorSubject<WebContainerProcess | null>(null),
    outputLocked: new BehaviorSubject<boolean>(false)
  };

  private watcher: IFSWatcher | null = null;

  private readonly progressWritable = signal({ currentStep: 0, totalSteps: 3, label: 'Initializing web-container' });

  /**
   * Progress indicator of the loading of a project.
   */
  public readonly progress = this.progressWritable.asReadonly();

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.instancePromise = WebContainer.boot().then((instance) => {
      this.progressWritable.update(({ totalSteps }) => ({ currentStep: 1, totalSteps, label: 'Loading project' }));
      // eslint-disable-next-line no-console -- only logger available
      const unsubscribe = instance.on('error', console.error);
      destroyRef.onDestroy(() => unsubscribe());
      return instance;
    });
    this.commandOnRun$.pipe(
      filter((currentCommand): currentCommand is { command: string; cwd: string } => !!currentCommand),
      takeUntilDestroyed()
    ).subscribe(({ command, cwd }) => {
      // TODO: support commands that contain spaces
      const commandElements = command.split(' ');
      void this.runCommand(commandElements[0], commandElements.slice(1), cwd);
    });

    combineLatest([
      this.iframe.pipe(
        filter((iframe): iframe is HTMLIFrameElement => !!iframe),
        distinctUntilChanged()
      ),
      this.instancePromise
    ]).pipe(
      switchMap(([iframe, instance]) => new Observable<[typeof iframe, typeof instance, boolean]>((subscriber) => {
        let shouldSkipFirstLoadEvent = true;
        const serverReadyUnsubscribe = instance.on('server-ready', (_port: number, url: string) => {
          this.progressWritable.update(({ totalSteps }) => ({ currentStep: totalSteps - 1, totalSteps, label: 'Bootstrapping application...' }));
          iframe.removeAttribute('srcdoc');
          iframe.src = url;
          subscriber.next([iframe, instance, shouldSkipFirstLoadEvent]);
          shouldSkipFirstLoadEvent = false;
        });
        return () => serverReadyUnsubscribe();
      })),
      switchMap(([iframe, _instance, shouldSkipFirstLoadEvent]) => fromEvent(iframe, 'load').pipe(
        skip(shouldSkipFirstLoadEvent ? 1 : 0),
        timeout({ each: 20_000, with: () => of([]) }),
        take(1)
      )),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.progressWritable.update(({ totalSteps }) => ({ currentStep: totalSteps, totalSteps, label: 'Ready!' }));
    });

    this.commandOutput.process.pipe(
      filter((process): process is WebContainerProcess => !!process && !process.output.locked),
      combineLatestWith(
        this.commandOutput.terminal.pipe(
          filter((terminal): terminal is Terminal => !!terminal)
        )
      ),
      filter(([process]) => !process.output.locked),
      takeUntilDestroyed()
    ).subscribe(([process, terminal]) =>
      void process.output.pipeTo(createTerminalStream(terminal))
    );
    this.shell.writer.pipe(
      filter((writer): writer is WritableStreamDefaultWriter => !!writer),
      combineLatestWith(
        this.shell.cwd.pipe(filter((cwd): cwd is string => !!cwd))
      ),
      combineLatestWith(this.instancePromise),
      takeUntilDestroyed()
    ).subscribe(async ([[writer, processCwd], instance]) => {
      try {
        await writer.write(`cd ${instance.workdir}/${processCwd} && clear \n`);
      } catch (e) {
        // eslint-disable-next-line no-console -- only logger available
        console.error(e, processCwd);
      }
    });
    this.shell.process.pipe(
      filter((process): process is null => !process),
      combineLatestWith(
        this.shell.terminal.pipe(filter((terminal): terminal is Terminal => !!terminal))
      ),
      combineLatestWith(this.instancePromise),
      switchMap(([[_, terminal], instance]) => {
        const spawn = instance.spawn('jsh', [], { env: { O3R_METRICS: false } });
        return from(spawn).pipe(
          map((process) => ({
            process,
            terminal
          }))
        );
      }),
      takeUntilDestroyed()
    ).subscribe(({ process, terminal }) => {
      void process.output.pipeTo(createTerminalStream(terminal, (data: string) => {
        if (['CREATE', 'UPDATE', 'RENAME', 'DELETE'].some((action) => data.includes(action))) {
          this.treeUpdateCallback();
        }
      }));
      this.shell.writer.next(makeProcessWritable(process, terminal));
      this.shell.process.next(process);
    });
  }

  /**
   * Callback on tree update
   */
  private treeUpdateCallback = () => {};

  /**
   * Run a command in the requested cwd and unqueue the runner commandList
   * @param command
   * @param args
   * @param cwd
   */
  private async runCommand(command: string, args: string[], cwd: string) {
    const instance = await this.instancePromise;
    const process = await instance.spawn(command, args, { cwd: cwd });
    this.commandOutput.process.next(process);
    const exitCode = await process.exit;
    if (exitCode === 0) {
      // The process has ended successfully
      this.progressWritable.update(({ currentStep, totalSteps }) => ({
        currentStep: currentStep + 1,
        totalSteps,
        label: this.getCommandLabel(this.commands.value.queue[1])
      }));
      this.commands.next({ queue: this.commands.value.queue.slice(1), cwd });
    } else if (exitCode === 143) {
      // The process was killed by switching to a new project
      return;
    } else {
      // The process has ended with an error
      throw new Error(`Command ${[command, ...args].join(' ')} failed with ${exitCode}!`);
    }
  }

  private getCommandLabel(command: string) {
    if (command) {
      if (/(npm|yarn) install/.test(command)) {
        return 'Installing dependencies...';
      } else if (/^(npm|yarn) (run .*:(build|serve)|(run )?build)/.test(command)) {
        return 'Building application...';
      } else {
        return `Executing \`${command}\``;
      }
    } else {
      return 'Waiting for server to start...';
    }
  }

  /**
   * Run a project. Mount requested files and run the associated commands in the cwd folder.
   * @param files to mount
   * @param commands to run in the project folder
   * @param projectFolder
   */
  public async runProject(files: FileSystemTree | null, commands: string[], projectFolder: string) {
    const instance = await this.instancePromise;
    // Ensure boot is done and instance is ready for use
    this.shell.cwd.next(projectFolder);
    killTerminal(this.commandOutput.terminal, this.commandOutput.process);
    const iframe = this.iframe.value;
    if (iframe) {
      iframe.src = '';
      iframe.srcdoc = 'Loading...';
    }
    if (this.watcher) {
      this.watcher.close();
    }
    if (files) {
      await instance.mount({ [projectFolder]: { directory: files } });
    }
    this.treeUpdateCallback();
    this.progressWritable.set({ currentStep: 2, totalSteps: 3 + commands.length, label: this.getCommandLabel(commands[0]) });
    this.commands.next({ queue: commands, cwd: projectFolder });
    this.watcher = instance.fs.watch(`/${projectFolder}`, { encoding: 'utf8' }, this.treeUpdateCallback);
  }

  /**
   * Register the method to call whenever the tree is updated
   * @param callback
   */
  public registerTreeUpdateCallback(callback: () => object) {
    this.treeUpdateCallback = callback;
  }

  /**
   * Register a new terminal that will be used as shell for the webcontainer
   * It is a dedicated sh process to input command.
   * @param terminal
   */
  public registerShell(terminal: Terminal) {
    this.shell.terminal.next(terminal);
  }

  /**
   * Register a new terminal to display the current process output
   * @param terminal
   */
  public registerCommandOutputTerminal(terminal: Terminal) {
    this.commandOutput.terminal.next(terminal);
  }

  /**
   * Register an iframe which will show the app resulting of the diverse commands run on the webcontainer
   * @param iframe
   */
  public registerIframe(iframe: HTMLIFrameElement | null) {
    const previousIframe = this.iframe.value;
    if (previousIframe) {
      previousIframe.src = '';
    }
    this.iframe.next(iframe);
  }

  /**
   * Kill the current shell process and unregister the shell terminal
   */
  public disposeShell() {
    this.shell.terminal.next(null);
    void this.shell.writer.value?.close();
    this.shell.writer.next(null);
    killTerminal(this.shell.terminal, this.shell.process);
  }

  /**
   * Kill the output terminal process and clear the console
   */
  public disposeCommandOutputTerminal() {
    killTerminal(this.shell.terminal, this.shell.process);
    this.commandOutput.terminal.next(null);
  }

  /**
   * Kill all the webContainer processes and unregister the terminal and iframe.
   */
  public killContainer() {
    killTerminal(this.shell.terminal, this.shell.process);
    killTerminal(this.commandOutput.terminal, this.commandOutput.process);
    const iframe = this.iframe.value;
    if (iframe) {
      iframe.src = '';
    }
  }
}
