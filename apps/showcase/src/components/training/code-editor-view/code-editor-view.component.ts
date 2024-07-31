import { AsyncPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
// import { debounceTime, map, skip, startWith, Subscription } from 'rxjs';
import { map, startWith, Subscription } from 'rxjs';
// import { WebcontainerService } from '../../../services/webcontainer/webcontainer.service';
import { NgxMonacoTreeModule } from '../ngx-monaco-tree/index';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';

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
  templateUrl: './code-editor-view.component.html',
  styleUrl: './code-editor-view.component.scss'
})
export class CodeEditorViewComponent implements AfterViewInit, OnDestroy {
  // private readonly webContainerService = inject(WebcontainerService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly sub = new Subscription();

  public tree = [{
    name: 'pouet',
    color: 'red',
    content: [{
      name: 'pouet-child.ts'
    }]
  }];
  public form: FormGroup = this.formBuilder.group({
    code: '',
    file: '/apps/tuto/src/app/app.component.ts'
  });
  public editorOptions$ = this.form.controls.file.valueChanges.pipe(
    startWith('/apps/tuto/src/app/app.component.ts'),
    map((filePath) => ({
      theme: 'vs-dark',
      language: editorOptionsLanguage[filePath.split('.').pop() || 'ts'] || editorOptionsLanguage.ts
    }))
  );
  // @ViewChild('iframe')
  // public iframeEl!: ElementRef<HTMLIFrameElement>;
  // @ViewChild('terminal')
  // public terminalEl: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('console')
  public consoleEl!: ElementRef<HTMLDivElement>;

  constructor() {
    // this.sub.add(
    //   this.form.controls.code.valueChanges.pipe(
    //     skip(1),
    //     debounceTime(1000)
    //   ).subscribe((text) =>
    //     this.webContainerService.writeFile(this.form.controls.file.value, text))
    // );
    // this.sub.add(
    //   this.form.controls.file.valueChanges.subscribe(async (file) => {
    //     const content = await this.webContainerService.readFile(file);
    //     this.form.controls.code.setValue(content);
    //   })
    // );
  }

  // private initTerminal(element: HTMLDivElement) {
  // const terminal = new Terminal({ convertEol: true });
  // terminal.open(element);
  // return terminal;
  // }

  public ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public async ngAfterViewInit() {
    if (this.consoleEl) {
      // const console = this.initTerminal(this.consoleEl.nativeElement);
      // if (this.iframeEl) {
      //   debugger;
      //   await this.webContainerService.launchProject(this.iframeEl.nativeElement, console);
      //   const content = await this.webContainerService.readFile(this.form.controls['file'].value);
      //   this.form.controls['code'].setValue(content);
      // }
      // if (this.terminalEl) {
      // const terminal = this.initTerminal(this.terminalEl.nativeElement);
      // void this.webContainerService.startShell(terminal);
      // }
    }
  }

  public async onClickFile(_filePath: any) {
    // if (await this.webContainerService.isFile(filePath)) {
    //   this.form.controls.file.setValue(filePath);
    // }
  }
}
