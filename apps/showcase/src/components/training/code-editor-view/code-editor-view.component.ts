import {AsyncPipe} from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileSystemTree} from '@webcontainer/api';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {combineLatest, debounceTime, distinctUntilChanged, filter, map, skip, startWith, Subscription} from 'rxjs';
import {WebContainerService} from '../../../services';
import {CodeEditorControlComponent} from '../code-editor-control';
import {NgxMonacoTreeComponent} from 'ngx-monaco-tree';

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
    FormsModule,
    MonacoEditorModule,
    ReactiveFormsModule,
    NgxMonacoTreeComponent,
    CodeEditorControlComponent
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './code-editor-view.component.html',
  styleUrl: './code-editor-view.component.scss'
})
export class CodeEditorViewComponent implements OnDestroy, OnChanges {

  @Input() public editorMode: EditorMode = 'readonly';
  @Input() public project?: TrainingProject;

  /** Variable to display "Log tree" button during debug mode */
  public debugMode = false;

  public readonly webContainerService = inject(WebContainerService);
  public tree$ = this.webContainerService.monacoTree$;
  private readonly formBuilder = inject(FormBuilder);
  private readonly subscriptions = new Subscription();

  public form: FormGroup = this.formBuilder.group({
    code: '',
    file: this.project?.startingFile || ''
  });
  public editorOptions$ = this.form.controls.file.valueChanges.pipe(
    startWith(this.project?.startingFile || ''),
    map((filePath: string) => ({
      theme: 'vs-dark',
      language: editorOptionsLanguage[filePath.split('.').pop() || 'ts'] || editorOptionsLanguage.ts,
      readOnly: (this.editorMode === 'readonly'),
      automaticLayout: true,
      scrollBeyondLastLine: false
    }))
  );

  constructor() {
    this.subscriptions.add(
      this.form.controls.code.valueChanges.pipe(
        distinctUntilChanged(),
        skip(1),
        debounceTime(300)
      ).subscribe(async (text) => {
        if (!this.project) {
          // eslint-disable-next-line no-console
          console.error('No project found');
          return;
        }
        const path = `${this.project.cwd}/${this.form.controls.file.value}`;
        if (path && await this.webContainerService.isFile(path)) {
          // eslint-disable-next-line no-console
          console.log('Writing file', path);
          void this.webContainerService.writeFile(`${this.project.cwd}/${this.form.controls.file.value}`, text);
        }
      })
    );
    this.subscriptions.add(
      combineLatest([this.form.controls.file.valueChanges, this.webContainerService.isReady$])
        .pipe(filter(([_, isReady]) => isReady))
        .subscribe(async ([path, isReady]: [string, boolean]) => {
          let content = '';
          const isFile = isReady && this.project && await this.webContainerService.isFile(`${this.project.cwd}/${path}`);
          if (path && isFile) {
            content = await this.webContainerService.readFile(`${this.project!.cwd}/${path}`);
          }
          if (content) {
            this.form.controls.code.setValue(content);
          } else {
            this.form.controls.code.setValue('');
          }
        })
    );
  }

  public async onClickFile(filePath: any) {
    if (!this.project) {
      return;
    }
    const path = `${this.project.cwd}/${filePath}`;
    if (this.project && await this.webContainerService.isFile(path)) {
      this.form.controls.file.setValue(filePath);
    }
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if ('project' in changes) {
      if (this.project && changes.project.currentValue !== changes.project.previousValue) {
        // Remove link between launch project and terminals
        await this.webContainerService.loadProject(this.project.files, this.project.commands, this.project.cwd);
      }

      if (this.project?.startingFile) {
        if (await this.webContainerService.isFile(`${this.project.cwd}/${this.project.startingFile}`)) {
          this.form.controls.file.setValue(this.project.startingFile);
        }
      } else {
        this.form.controls.file.setValue('');
        this.form.controls.code.setValue('');
      }
    }
  }

  public ngOnDestroy() {
    this.webContainerService.runner.killContainer();
    this.subscriptions.unsubscribe();
  }

  public logTree() {
    void this.webContainerService.logTree();
  }
}
