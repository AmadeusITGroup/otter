import {
  Component,
  ElementRef,
  inject, Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {WebContainerProcess} from '@webcontainer/api';
import {Terminal} from '@xterm/xterm';
import {WebcontainerService} from '../../../services/webcontainer/webcontainer.service';


@Component({
  selector: 'code-editor-terminal',
  standalone: true,
  imports: [],
  template: '<div #terminal></div>'
})
export class CodeEditorTerminalComponent implements OnDestroy {
  public terminal?: Terminal;
  private readonly webContainerService = inject(WebcontainerService);
  @ViewChild('terminal')
  public terminalEl!: ElementRef<HTMLDivElement>;

  @Input()
  public standalone: boolean = false;

  private terminalProcess?: WebContainerProcess;

  private initTerminal() {
    console.log('Init terminal');
    this.terminal = new Terminal({convertEol: true});
    this.terminal.open(this.terminalEl.nativeElement);
    if (this.standalone) {
      this.startShell();
    }
  }

  public setProcess(newProcess: WebContainerProcess) {
    if (this.terminalProcess) {
      this.terminalProcess.kill();
    }
    this.terminalProcess = newProcess;
  }

  public startShell() {
    void this.webContainerService.startShell(this.terminal!).then(
      (shellProcess) => this.setProcess(shellProcess)
    );
  }

  public ngOnDestroy() {
    this.terminal?.dispose();
    this.terminalProcess?.kill();
  }

  public ngAfterViewInit() {
    if (this.terminalEl?.nativeElement) {
      this.initTerminal();
    }
  }

  kill() {
    this.terminalProcess?.kill();
  }
}
