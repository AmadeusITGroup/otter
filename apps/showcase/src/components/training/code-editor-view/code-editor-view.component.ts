import {AsyncPipe, JsonPipe} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileSystemTree} from '@webcontainer/api';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {MonacoTreeElement, NgxMonacoTreeComponent} from 'ngx-monaco-tree';
import {
  BehaviorSubject,
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  filter,
  from,
  map,
  Observable,
  of,
  skip,
  startWith,
  switchMap
} from 'rxjs';
import {WebContainerService} from '../../../services';
import {checkIfPathInMonacoTree} from '../../../helpers/monaco-tree.helper';
import {CodeEditorControlComponent} from '../code-editor-control';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/** ngx-monaco-editor options language - determined based on file extension */
const editorOptionsLanguage: Record<string, string> = {
  html: 'xml',
  json: 'json',
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

@Component({
  selector: 'code-editor-view',
  standalone: true,
  imports: [
    AsyncPipe,
    CodeEditorControlComponent,
    FormsModule,
    JsonPipe,
    MonacoEditorModule,
    NgxMonacoTreeComponent,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './code-editor-view.component.html',
  styleUrl: './code-editor-view.component.scss'
})
export class CodeEditorViewComponent implements OnDestroy, OnChanges {
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
   * Allow to edit the code in the monaco editor
   */
  @Input() public editorMode: EditorMode = 'readonly';
  /**
   * Project to load in the code editor.
   * It should describe the files to load, the starting file, the folder dedicated to the project as well as the
   * commands to initialize the project
   */
  @Input() public project?: TrainingProject;
  /**
   * Service to load files and run commands in the application instance of the webcontainer.
   */
  public readonly webContainerService = inject(WebContainerService);
  /**
   * File tree loaded in the project folder within the web container instance.
   */
  public cwdTree$: Observable<MonacoTreeElement[]> = this.cwd$.pipe(
    switchMap((cwd) =>
      cwd ? this.webContainerService.monacoTree$.pipe(
        map((tree) => tree.find((treeElement) => treeElement.name === cwd)?.content || [])
      ) : of([])
    )
  );
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
   * Configuration for the Monaco Editor
   */
  public editorOptions$ = this.form.controls.file.valueChanges.pipe(
    startWith(''),
    filter((filePath): filePath is string => !!filePath),
    map((filePath) => ({
      theme: 'vs-dark',
      language: editorOptionsLanguage[filePath.split('.').pop() || 'ts'] || editorOptionsLanguage.ts,
      readOnly: (this.editorMode === 'readonly'),
      automaticLayout: true,
      scrollBeyondLastLine: false
    }))
  );

  constructor() {
    this.form.controls.code.valueChanges.pipe(
      distinctUntilChanged(),
      skip(1),
      debounceTime(300),
      filter((text): text is string => !!text),
      takeUntilDestroyed()
    ).subscribe((text: string) => {
      if (!this.project) {
        // eslint-disable-next-line no-console
        console.error('No project found');
        return;
      }
      const path = `${this.project.cwd}/${this.form.controls.file.value}`;
      // eslint-disable-next-line no-console
      console.log('Writing file', path);
      void this.webContainerService.writeFile(path, text);
    });
    this.form.controls.file.valueChanges.pipe(
      combineLatestWith(this.cwdTree$),
      filter(([path, monacoTree]) => !!path && checkIfPathInMonacoTree(monacoTree, path.split('/'))),
      switchMap(([path]) => from(this.webContainerService.readFile(`${this.project!.cwd}/${path}`))),
      takeUntilDestroyed()
    ).subscribe((content) => this.form.controls.code.setValue(content));
  }

  /**
   * @inheritDoc
   */
  public async onClickFile(filePath: string) {
    if (!this.project) {
      return;
    }
    const path = `${this.project.cwd}/${filePath}`;
    if (this.project && await this.webContainerService.isFile(path)) {
      this.form.controls.file.setValue(filePath);
    }
  }

  /**
   * @inheritDoc
   */
  public ngOnChanges(changes: SimpleChanges) {
    if ('project' in changes) {
      if (this.project?.files) {
        // Remove link between launch project and terminals
        void this.webContainerService.loadProject(this.project.files, this.project.commands, this.project.cwd);
      }

      if (this.project?.startingFile) {
        this.form.controls.file.setValue(this.project.startingFile);
      } else {
        this.form.controls.file.setValue('');
        this.form.controls.code.setValue('');
      }
      this.cwd$.next(this.project?.cwd || '');
    }
  }

  /**
   * @inheritDoc
   */
  public ngOnDestroy() {
    this.webContainerService.runner.killContainer();
  }
}
