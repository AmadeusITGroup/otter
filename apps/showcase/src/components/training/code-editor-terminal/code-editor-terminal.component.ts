import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy, Output,
  ViewChild
} from '@angular/core';
import {Terminal} from '@xterm/xterm';


@Component({
  selector: 'code-editor-terminal',
  standalone: true,
  imports: [],
  template: '<div #terminal></div>'
})
export class CodeEditorTerminalComponent implements OnDestroy {
  private readonly terminal: Terminal = new Terminal({convertEol: true});

  @ViewChild('terminal')
  public terminalEl!: ElementRef<HTMLDivElement>;
  @Output()
  public readonly terminalUpdated = new EventEmitter<Terminal>();
  @Output()
  public readonly disposed = new EventEmitter<void>();

  private initTerminal() {
    this.terminal.open(this.terminalEl.nativeElement);
    this.terminalUpdated.emit(this.terminal);
  }

  public ngAfterViewInit() {
    this.initTerminal();
  }

  public ngOnDestroy() {
    this.terminal.dispose();
    this.disposed.emit();
  }
}
