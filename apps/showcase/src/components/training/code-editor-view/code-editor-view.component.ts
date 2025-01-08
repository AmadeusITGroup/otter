import {
  AsyncPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  DfModalService,
} from '@design-factory/design-factory';
import {
  LoggerService,
} from '@o3r/logger';
import {
  FileSystemTree,
} from '@webcontainer/api';
import {
  AngularSplitModule,
} from 'angular-split';
import type * as Monaco from 'monaco-editor';
import {
  MonacoEditorModule,
} from 'ngx-monaco-editor-v2';
import {
  MonacoTreeElement,
  NgxMonacoTreeComponent,
} from 'ngx-monaco-tree';
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  from,
  map,
  merge,
  Observable,
  of,
  shareReplay,
  skip,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import {
  checkIfPathInMonacoTree,
} from '../../../helpers/monaco-tree/monaco-tree.helper';
import {
  flattenTree,
  WebContainerService,
} from '../../../services';
import {
  CodeEditorControlComponent,
} from '../code-editor-control';
import {
  SaveCodeDialogComponent,
} from '../save-code-dialog';

declare global {
  interface Window {
    monaco: typeof Monaco;
  }
}

/** ngx-monaco-editor options language - determined based on file extension */
const editorOptionsLanguage: Record<string, string> = {
  html: 'xml',
  json: 'json',
  md: 'markdown',
  ts: 'typescript',
  js: 'javascript'
};

/** Mode of Code Editor */
export type EditorMode = 'readonly' | 'interactive';

/** Project properties for the current exercise */
export interface TrainingProject {
  /** Starting file to be displayed in the project */
  startingFile: string;
  /** Files in the project */
  files: FileSystemTree;
  /** Commands to run in the project */
  commands: string[];
  /** Current working directory in project */
  cwd: string;
}

export class MonacoFailedToLoadError extends Error {
  constructor(error: any) {
    super(
      error.toString() as string
      + '\n\nMonaco failed to load in the imparted time'
    );
  }
}

@Component({
  selector: 'code-editor-view',
  standalone: true,
  imports: [
    AsyncPipe,
    CodeEditorControlComponent,
    FormsModule,
    MonacoEditorModule,
    NgxMonacoTreeComponent,
    ReactiveFormsModule,
    AngularSplitModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './code-editor-view.component.html',
  styleUrl: './code-editor-view.component.scss'
})
export class CodeEditorViewComponent implements OnDestroy {
  /**
   * @see {FormBuilder}
   */
  private readonly formBuilder = inject(FormBuilder);

  /**
   * Stream of the working directory for this component to use it to compute the monaco tree from the
   * {@link WebContainerService} tree
   */
  private readonly cwd$ = new BehaviorSubject('');

  /**
   * Logger service that will manage which logger should be used
   */
  private readonly loggerService = inject(LoggerService);

  /**
   * Allow to edit the code in the monaco editor
   */
  public editorMode = input<EditorMode>('readonly');

  /**
   * Display terminal
   */
  public displayTerminal = input<boolean>(true);

  /**
   * Project to load in the code editor.
   * It should describe the files to load, the starting file, the folder dedicated to the project as well as the
   * commands to initialize the project
   */
  public project = input.required<TrainingProject>();

  /**
   * Service to load files and run commands in the application instance of the webcontainer.
   */
  public readonly webContainerService = inject(WebContainerService);

  /**
   * File tree loaded in the project folder within the web container instance.
   */
  public cwdTree$: Observable<MonacoTreeElement[]> = this.cwd$.pipe(
    switchMap((cwd) =>
      cwd
        ? this.webContainerService.monacoTree$.pipe(
          map((tree) => tree.find((treeElement) => treeElement.name === cwd)?.content || [])
        )
        : of([])
    ),
    filter((tree) => tree.length > 0),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Signal that reflects the current value of the monaco tree in the project directory
   */
  public cwdTreeSignal = toSignal(this.cwdTree$, { initialValue: [] });

  /**
   * Form with the selected file and its content which can be edited in the Monaco Editor
   */
  public form: FormGroup<{
    code: FormControl<string | null>;
    file: FormControl<string | null>;
  }> = this.formBuilder.group({
      code: '',
      file: ''
    });

  /**
   * Subject used to notify when a new monaco editor has been created
   */
  public readonly newMonacoEditorCreated = new Subject<void>();

  /**
   * Promise resolved with the global monaco instance
   */
  private readonly monacoPromise = firstValueFrom(this.newMonacoEditorCreated.pipe(
    map(() => window.monaco)
  )).catch(
    () => Promise.reject(new MonacoFailedToLoadError('[CodeEditorView] Missing Monaco editor'))
  );

  /**
   * Configuration for the Monaco Editor
   */
  public editorOptions$ = this.form.controls.file.valueChanges.pipe(
    filter((filePath): filePath is string => !!filePath),
    map(() => ({
      theme: 'vs-dark',
      readOnly: (this.editorMode() === 'readonly'),
      automaticLayout: true,
      scrollBeyondLastLine: false,
      fixedOverflowWidgets: true,
      model: this.model()
    }))
  );

  private readonly modalService = inject(DfModalService);
  private readonly forceReload = new Subject<void>();
  private readonly forceSave = new Subject<void>();

  private readonly fileContentLoaded$ = combineLatest([
    this.form.controls.file.valueChanges,
    this.forceReload.pipe(startWith(undefined))
  ]).pipe(
    takeUntilDestroyed(),
    combineLatestWith(this.cwdTree$),
    filter(([[path], monacoTree]) => !!path && checkIfPathInMonacoTree(monacoTree, path.split('/'))),
    switchMap(([[path]]) => from(this.webContainerService.readFile(`${this.project().cwd}/${path}`).catch(() => ''))),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  private readonly fileContent = toSignal(this.fileContentLoaded$);

  /**
   * Model used for monaco editor for the currently selected file.
   * We need that to associate the opened file to a URI which is necessary to resolve relative paths on imports.
   */
  public model = computed(() => {
    const value = this.fileContent();
    const fileName = this.form.controls.file.value!;
    const fileExtension = fileName.split('.').at(-1);
    return {
      value,
      language: editorOptionsLanguage[fileExtension || ''] || '',
      uri: `file:///${fileName}`
    };
  });

  constructor() {
    effect(async () => {
      const project = this.project();
      await untracked(async () => {
        if (project.files) {
          await this.webContainerService.loadProject(project.files, project.commands, project.cwd);
          this.loadNewProject();
          this.cwd$.next(project?.cwd || '');
        }
      });
    });
    this.forceReload.subscribe(async () => {
      try {
        await this.cleanAllModelsFromMonaco();
        await this.loadAllProjectFilesToMonaco();
      } catch (e: any) {
        if (e instanceof MonacoFailedToLoadError) {
          this.loggerService.warn(e);
          return;
        }
        throw e;
      }
    });
    merge(
      this.forceSave.pipe(map(() => this.form.value.code)),
      this.form.controls.code.valueChanges.pipe(
        distinctUntilChanged(),
        skip(1),
        debounceTime(1000)
      )
    ).pipe(
      filter((text): text is string => !!text),
      takeUntilDestroyed()
    ).subscribe((text: string) => {
      const project = this.project();
      if (!project) {
        this.loggerService.error('No project found');
        return;
      }
      const { cwd } = project;
      if (text !== this.fileContent() || localStorage.getItem(cwd)) {
        localStorage.setItem(cwd, JSON.stringify({
          ...JSON.parse(localStorage.getItem(cwd) || '{}'),
          [this.form.controls.file.value!]: text
        }));
      }
      const path = `${this.project().cwd}/${this.form.controls.file.value}`;
      this.loggerService.log('Writing file', path);
      void this.webContainerService.writeFile(path, text);
    });
    this.fileContentLoaded$.subscribe(
      (content) => this.form.controls.code.setValue(content)
    );

    // Reload definition types when finishing install
    this.webContainerService.runner.dependenciesLoaded$.pipe(
      takeUntilDestroyed()
    ).subscribe(async () => {
      try {
        await this.reloadDeclarationTypes();
      } catch (e: any) {
        if (e instanceof MonacoFailedToLoadError) {
          this.loggerService.warn(e);
          return;
        }
        throw e;
      }
    });
    const revealCodeInEditorRequest = new Subject<Monaco.IPosition | Monaco.IRange>();
    revealCodeInEditorRequest.pipe(
      takeUntilDestroyed(),
      switchMap((selectionOrPosition) => this.newMonacoEditorCreated.pipe(map(() => selectionOrPosition)))
    ).subscribe((selectionOrPosition) => {
      if (window.monaco.Position.isIPosition(selectionOrPosition)) {
        window.monaco.editor.getEditors()[0].revealPositionNearTop(selectionOrPosition);
      } else {
        window.monaco.editor.getEditors()[0].revealRangeNearTop(selectionOrPosition);
      }
    });
    void this.monacoPromise.then((monaco) => {
      monaco.editor.registerEditorOpener({
        openCodeEditor: (_source: Monaco.editor.ICodeEditor, resource: Monaco.Uri, selectionOrPosition?: Monaco.IRange | Monaco.IPosition) => {
          const filePath = resource.path.slice(1);
          const monacoTree = this.cwdTreeSignal();
          const pathElements = resource.path.split('/').filter((pathElement) => !!pathElement);
          if (checkIfPathInMonacoTree(monacoTree, pathElements)) {
            this.form.controls.file.setValue(filePath);
            if (selectionOrPosition) {
              revealCodeInEditorRequest.next(selectionOrPosition);
            }
            return true;
          }
          return false;
        }
      });
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        allowNonTsExtensions: true,
        target: monaco.languages.typescript.ScriptTarget.Latest,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        paths: {
          sdk: [
            'file:///libs/sdk/src/index'
          ],
          'sdk/*': [
            'file:///libs/sdk/src/*'
          ]
        }
      });
    });
    void this.retrieveSaveChanges();
  }

  private async retrieveSaveChanges() {
    await firstValueFrom(this.cwdTree$);
    const { cwd } = this.project();
    const savedState = localStorage.getItem(cwd);
    if (!savedState) {
      return;
    }
    const state = JSON.parse(savedState);
    const hasDiscrepancies = (await Promise.any(
      Object.entries<string>(state).map(async ([path, textLocalStorage]) => {
        const textWebContainer = await this.webContainerService.readFile(`${this.project().cwd}/${path}`).catch(() => undefined);
        if (textLocalStorage === textWebContainer) {
          throw new Error('No discrepancies');
        }
        return true;
      }
      )).catch(() => false));
    if (!hasDiscrepancies) {
      return;
    }
    const modal = this.modalService.open(
      SaveCodeDialogComponent,
      {
        backdrop: 'static',
        container: '.editor',
        backdropClass: 'save-code-dialog-backdrop',
        windowClass: 'save-code-dialog-window'
      }
    );
    void modal.result.then(async (positiveReply) => {
      if (positiveReply) {
        await Promise.all(
          Object.entries<string>(state).map(([path, text]) => this.webContainerService.writeFile(`${cwd}/${path}`, text))
        );
        this.forceReload.next();
      } else {
        localStorage.removeItem(cwd);
      }
    });
  }

  /**
   * Unload all the files from the global monaco editor
   */
  private async cleanAllModelsFromMonaco() {
    const monaco = await this.monacoPromise;
    monaco.editor.getModels().forEach((m) => m.dispose());
  }

  /**
   * Load all the files from `this.project` as Models in the global monaco editor.
   */
  private async loadAllProjectFilesToMonaco() {
    const monaco = await this.monacoPromise;
    const flatFiles = flattenTree(this.project().files);
    flatFiles.forEach(({ filePath, content }) => {
      const language = editorOptionsLanguage[filePath.split('.').at(-1) || ''] || '';
      monaco.editor.createModel(content, language, monaco.Uri.from({ scheme: 'file', path: filePath }));
    });
    // Refresh tsconfig paths mapping
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
      monaco.languages.typescript.typescriptDefaults.getCompilerOptions()
    );
  }

  /**
   * Load a new project in global monaco editor and update local form accordingly
   */
  private loadNewProject() {
    this.form.controls.file.setValue(this.project().startingFile);
    this.forceReload.next();
  }

  /**
   * Reload declaration types from web-container
   */
  public async reloadDeclarationTypes() {
    if (this.project().cwd) {
      const declarationTypes = [
        ...await this.webContainerService.getDeclarationTypes(this.project().cwd),
        { filePath: 'file:///node_modules/@ama-sdk/core/index.d.ts', content: 'export * from "./src/public_api.d.ts";' },
        {
          filePath: 'file:///node_modules/@ama-sdk/client-fetch/index.d.ts',
          content: 'export * from "./src/public_api.d.ts";'
        }
      ];
      const monaco = await this.monacoPromise;
      monaco.languages.typescript.typescriptDefaults.setExtraLibs(declarationTypes);
    }
  }

  public onEditorKeyDown(event: KeyboardEvent) {
    const ctrlKey = /mac/i.test(navigator.userAgent) ? event.metaKey : event.ctrlKey;
    if (ctrlKey && event.key.toLowerCase() === 's') {
      this.forceSave.next();
      event.stopPropagation();
      event.preventDefault();
    }
  }

  /**
   * @inheritDoc
   */
  public async onClickFile(filePath: string) {
    const path = `${this.project().cwd}/${filePath}`;
    if (await this.webContainerService.isFile(path)) {
      this.form.controls.file.setValue(filePath);
    }
  }

  /**
   * @inheritDoc
   */
  public ngOnDestroy() {
    this.forceReload.complete();
    this.forceSave.complete();
    this.newMonacoEditorCreated.complete();
    this.webContainerService.runner.killContainer();
  }
}
