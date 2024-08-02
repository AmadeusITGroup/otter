import {AsyncPipe} from '@angular/common';
import {AfterViewInit, Component, ElementRef, inject, Input, OnDestroy, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Terminal} from '@xterm/xterm';
import {debounceTime, map, skip, startWith, Subscription} from 'rxjs';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {WebcontainerService} from '../../../services/webcontainer/webcontainer.service';
import {NgxMonacoTreeModule} from '../ngx-monaco-tree/index';

const editorOptionsLanguage: Record<string, string> = {
  html: 'xml',
  json: 'json',
  ts: 'typescript',
  js: 'javascript'
};

@Component({
  selector: 'code-editor-view',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MonacoEditorModule,
    ReactiveFormsModule,
    NgxMonacoTreeModule
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './code-editor-view.component.html',
  styleUrl: './code-editor-view.component.scss'
})
export class CodeEditorViewComponent implements AfterViewInit, OnDestroy {
  @Input() filesPath?: string;

  private readonly webContainerService = inject(WebcontainerService);
  public tree$ = this.webContainerService.monacoTree$;
  private readonly formBuilder = inject(FormBuilder);
  private readonly subscriptions = new Subscription();

  public form: FormGroup = this.formBuilder.group({
    code: '',
    file: '/apps/tuto/src/app/app.component.ts'
  });
  public editorOptions$ = this.form.controls.file.valueChanges.pipe(
    startWith('/apps/tuto/src/app/app.component.ts'),
    map((filePath: string) => ({
      theme: 'vs-dark',
      language: editorOptionsLanguage[filePath.split('.').pop() || 'ts'] || editorOptionsLanguage.ts
    }))
  );
  @ViewChild('iframe')
  public iframeEl!: ElementRef<HTMLIFrameElement>;
  @ViewChild('terminal')
  public terminalEl: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('console')
  public consoleEl!: ElementRef<HTMLDivElement>;

  constructor() {
    this.subscriptions.add(
      this.form.controls.code.valueChanges.pipe(
        skip(1),
        debounceTime(1000)
      ).subscribe((text) =>
        this.webContainerService.writeFile(this.form.controls.file.value, text))
    );
    this.subscriptions.add(
      this.form.controls.file.valueChanges.subscribe(async (path: string) => {
        const content = await this.webContainerService.readFile(path);
        if (content) {
          this.form.controls.code.setValue(content);
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

  public async ngAfterViewInit() {
    if (this.iframeEl && this.consoleEl) {
      const consoleTerm = this.initTerminal(this.consoleEl.nativeElement);
      await this.webContainerService.launchProject(this.iframeEl.nativeElement, consoleTerm, this.filesPath);
      const content = await this.webContainerService.readFile(this.form.controls.file.value);
      this.form.controls.code.setValue(content);
    }
    if (this.terminalEl) {
      const terminal = this.initTerminal(this.terminalEl.nativeElement);
      void this.webContainerService.startShell(terminal);
    }
  }

  public async onClickFile(filePath: any) {
    if (await this.webContainerService.isFile(filePath)) {
      this.form.controls.file.setValue(filePath);
    }
  }
}
