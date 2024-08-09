import {AsyncPipe, JsonPipe} from '@angular/common';
import {
  Component, ContentChild,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileSystemTree} from '@webcontainer/api';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {debounceTime, distinctUntilChanged, map, skip, startWith, Subscription} from 'rxjs';
import {WebcontainerService} from '../../../services/webcontainer/webcontainer.service';
import {NgxMonacoTreeModule} from '../ngx-monaco-tree/index';
import {CodeEditorTerminalComponent} from '../code-editor-terminal';

const editorOptionsLanguage: Record<string, string> = {
  html: 'xml',
  json: 'json',
  ts: 'typescript',
  js: 'javascript'
};

export type EditorMode = 'readonly' | 'interactive';

@Component({
  selector: 'code-editor-view',
  standalone: true,
  imports: [
    AsyncPipe,
    CodeEditorTerminalComponent,
    FormsModule,
    MonacoEditorModule,
    ReactiveFormsModule,
    NgxMonacoTreeModule,
    JsonPipe
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './code-editor-view.component.html',
  styleUrl: './code-editor-view.component.scss'
})
export class CodeEditorViewComponent implements OnDestroy, OnChanges {
  @Input() public filesContent?: FileSystemTree;

  @Input() public startingFile = '';

  @Input() public editorMode: EditorMode = 'readonly';

  @Input() public commands: string[] = [];

  @Input() public showInstructions = true;

  private readonly webContainerService = inject(WebcontainerService);
  public tree$ = this.webContainerService.monacoTree$;
  private readonly formBuilder = inject(FormBuilder);
  private readonly subscriptions = new Subscription();

  public form: FormGroup = this.formBuilder.group({
    code: '',
    file: this.startingFile
  });
  public editorOptions$ = this.form.controls.file.valueChanges.pipe(
    startWith(this.startingFile),
    map((filePath: string) => ({
      theme: 'vs-dark',
      language: editorOptionsLanguage[filePath.split('.').pop() || 'ts'] || editorOptionsLanguage.ts,
      readOnly: (this.editorMode === 'readonly'),
      automaticLayout: true,
      scrollBeyondLastLine: false
    }))
  );
  @ViewChild('iframe')
  public iframeEl!: ElementRef<HTMLIFrameElement>;
  @ContentChild('console')
  public consoleEl!: CodeEditorTerminalComponent;

  constructor() {
    this.subscriptions.add(
      this.form.controls.code.valueChanges.pipe(
        distinctUntilChanged(),
        skip(1),
        debounceTime(1000)
      ).subscribe((text) => {
        const path = this.form.controls.file.value;
        if (path) {
          void this.webContainerService.writeFile(this.form.controls.file.value, text);
        }
      })
    );
    this.subscriptions.add(
      this.form.controls.file.valueChanges
        .subscribe(async (path: string) => {
          if (path && this.webContainerService.isReady()) {
            const content = await this.webContainerService.readFile(path);
            if (content) {
              this.form.controls.code.setValue(content);
            }
          } else {
            this.form.controls.code.setValue('');
          }
        })
    );
  }

  public async onClickFile(filePath: any) {
    if (await this.webContainerService.isFile(filePath)) {
      this.form.controls.file.setValue(filePath);
    }
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if ('startingFile' in changes && changes.startingFile.currentValue) {
      this.form.controls.file.setValue(changes.startingFile.currentValue);
    }
    if ('filesContent' in changes || 'commands' in changes) {
      if (this.filesContent) {
        // Remove link between launch project and terminals
        await this.webContainerService.loadProject(this.filesContent);
        // TODO create a method to handle the update of forms
        if (this.startingFile) {
          this.form.controls.file.setValue(this.startingFile);
          const content = await this.webContainerService.readFile(this.startingFile);
          this.form.controls.code.setValue(content);
        } else {
          this.form.controls.code.setValue('');
        }
      } else {
        void this.webContainerService.destroyInstance();
        this.form.controls.code.setValue('');
      }
    }
    if ('commands' in changes) {
      if (!this.commands || this.commands.length === 0) {
        this.consoleEl?.kill();
        return;
      }
      if (this.commands?.length > 0 && !this.iframeEl?.nativeElement || !this.consoleEl?.terminal) {
        console.error('Missing iframe and terminal to run webcontainer initialization commands');
        return;
      }
      // Move console in a new shell
      this.consoleEl.kill();
      void this.webContainerService.runCommands(this.commands, this.iframeEl.nativeElement, this.consoleEl.terminal);
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.webContainerService.destroyInstance();
  }

  public logTree() {
    void this.webContainerService.logTree();
  }
}
