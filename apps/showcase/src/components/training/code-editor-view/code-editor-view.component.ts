import {AsyncPipe, JsonPipe} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy, SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileSystemTree} from '@webcontainer/api';
import {Terminal} from '@xterm/xterm';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {debounceTime, distinctUntilChanged, map, skip, startWith, Subscription} from 'rxjs';
import {WebcontainerService} from '../../../services/webcontainer/webcontainer.service';
import {NgxMonacoTreeModule} from '../ngx-monaco-tree/index';

const editorOptionsLanguage: Record<string, string> = {
  html: 'xml',
  json: 'json',
  ts: 'typescript',
  js: 'javascript'
};

export type FileConfiguration = {
  startingFile: string;
  filesContent: FileSystemTree | null;
};

export type EditorMode = 'readonly' | 'interactive';

@Component({
  selector: 'code-editor-view',
  standalone: true,
  imports: [
    AsyncPipe,
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
export class CodeEditorViewComponent implements AfterViewInit, OnDestroy {
  // Si on doit partager des fichiers shared, je me demande si on doit pas faire des choses plus complexes
  // @Input() filesPath?: string;
  @Input() public filesContent?: FileSystemTree;

  @Input() public startingFile: string = '';

  @Input() public editorMode: EditorMode = 'readonly';

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
      readOnly: (this.editorMode === 'readonly')
    }))
  );
  @ViewChild('iframe')
  public iframeEl!: ElementRef<HTMLIFrameElement>;
  @ViewChild('terminal')
  public terminalEl: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('console')
  public consoleEl!: ElementRef<HTMLDivElement>;

  private consoleTerminal?: Terminal;

  constructor() {
    this.subscriptions.add(
      this.form.controls.code.valueChanges.pipe(
        distinctUntilChanged(),
        skip(1),
        debounceTime(1000)
      ).subscribe((text) => {
        const path = this.form.controls.file.value;
        if (path) {
          void this.webContainerService.writeFile(this.form.controls.file.value, text)
        }
      })
    );
    this.subscriptions.add(
      this.form.controls.file.valueChanges
        .subscribe(async (path: string) => {
          if (path) {
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

  private initTerminal(element: HTMLDivElement) {
    const terminal = new Terminal({convertEol: true});
    terminal.open(element);
    return terminal;
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.webContainerService.destroyInstance();
  }

  public ngAfterViewInit() {
    if (this.consoleEl) {
      this.consoleTerminal = this.initTerminal(this.consoleEl.nativeElement);
    }
    if (this.terminalEl) {
      const terminal = this.initTerminal(this.terminalEl.nativeElement);
      void this.webContainerService.startShell(terminal);
    }
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if ('filesContent' in changes) {
      if (changes.filesContent.currentValue) {
        await this.webContainerService.launchProject(changes.filesContent.currentValue, this.iframeEl?.nativeElement, this.consoleTerminal);
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
  }

  public async onClickFile(filePath: any) {
    if (await this.webContainerService.isFile(filePath)) {
      this.form.controls.file.setValue(filePath);
    }
  }

  public consoleLogSDK() {
    void this.webContainerService.consoleFiles();
  }
}
