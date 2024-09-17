import {
  type AfterViewChecked,
  type AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  type OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';

@Component({
  selector: 'code-editor-terminal',
  standalone: true,
  imports: [],
  template: '<div #terminal class="h-100"></div>'
})
export class CodeEditorTerminalComponent implements OnDestroy, AfterViewChecked, AfterViewInit {
  private readonly terminal = new Terminal({convertEol: true});
  private readonly fitAddon = new FitAddon();

  @ViewChild('terminal')
  public terminalEl!: ElementRef<HTMLDivElement>;
  @Output()
  public readonly terminalUpdated = new EventEmitter<Terminal>();
  @Output()
  public readonly disposed = new EventEmitter<void>();

  constructor() {
    this.terminal.loadAddon(this.fitAddon);
  }

  private initTerminal() {
    this.terminal.open(this.terminalEl.nativeElement);
    this.terminalUpdated.emit(this.terminal);
  }

  public ngAfterViewInit() {
    this.initTerminal();
  }

  public ngAfterViewChecked() {
    this.fitAddon.fit();
  }

  public ngOnDestroy() {
    this.terminal.dispose();
    this.disposed.emit();
  }
}
