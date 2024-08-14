import {AsyncPipe, JsonPipe} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild, ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileSystemTree} from '@webcontainer/api';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {combineLatest, debounceTime, distinctUntilChanged, map, skip, startWith, Subscription} from 'rxjs';
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
export class CodeEditorViewComponent implements OnDestroy, OnChanges, AfterViewInit {
  @Input() public filesContent?: FileSystemTree;

  @Input() public editorMode: EditorMode = 'readonly';

  @Input() public project?: {
    commands: string[];
    filesContent: FileSystemTree;
    startingFile: string;
  };

  @Input() public showInstructions = true;

  public readonly webContainerService = inject(WebcontainerService);
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
  // TODO see if I can subscribe iframe and console after run of command (and not depend on them)
  @ViewChild('iframe')
  public iframeEl!: ElementRef<HTMLIFrameElement>;

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
      combineLatest([this.form.controls.file.valueChanges, this.webContainerService.isReady$()])
        .subscribe(async ([path, isReady]: [string, boolean]) => {
          if (path && isReady) {
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

  public ngAfterViewInit() {
    this.webContainerService.registerIframe(this.iframeEl.nativeElement);
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if ('project' in changes) {
      if (this.project) {
        console.log('Update project', this.project);
        // Remove link between launch project and terminals
        await this.webContainerService.loadProject(this.project.filesContent, this.project.commands);
        // TODO create a method to handle the update of forms
      }

      if (this.project?.startingFile) {
        this.form.controls.file.setValue(this.project.startingFile);
        const content = await this.webContainerService.readFile(this.project.startingFile);
        this.form.controls.code.setValue(content);
      } else {
        this.form.controls.code.setValue('');
        this.form.controls.name.setValue('');
      }
    }
  }

  public ngOnDestroy() {
    this.webContainerService.clearContainer();
    this.subscriptions.unsubscribe();
  }

  public logTree() {
    void this.webContainerService.logTree();
  }
}
