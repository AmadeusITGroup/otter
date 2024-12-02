import {
  type AfterViewChecked,
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  type OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FitAddon,
} from '@xterm/addon-fit';
import {
  Terminal,
} from '@xterm/xterm';

@Component({
  selector: 'code-editor-terminal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
  template: '<div #terminal class="h-100"></div>'
})
export class CodeEditorTerminalComponent implements OnDestroy, AfterViewChecked, AfterViewInit {
  /**
   * Terminal component that can be used as input/output element for a webcontainer process
   */
  private readonly terminal = new Terminal({ convertEol: true });
  /**
   * Plugin to handle resizing of a Terminal component
   */
  private readonly fitAddon = new FitAddon();

  /**
   * HTML reference to the terminal container in the CodeEditorTerminal component
   */
  @ViewChild('terminal')
  public terminalEl!: ElementRef<HTMLDivElement>;

  /**
   * Inform the parent that the terminal of the component has been created and is ready to use as input/output
   * of a process
   */
  @Output()
  public readonly terminalUpdated = new EventEmitter<Terminal>();

  /**
   * Inform the parent that something got written in the terminal
   */
  @Output()
  public readonly terminalActivity = new EventEmitter<void>();

  /**
   * Inform the parent that the terminal of the component has been disposed of
   */
  @Output()
  public readonly disposed = new EventEmitter<void>();

  constructor() {
    this.terminal.loadAddon(this.fitAddon);
    const disposable = this.terminal.onWriteParsed(() => {
      this.terminalActivity.emit();
    });
    inject(DestroyRef).onDestroy(() => disposable.dispose());
  }

  /**
   * Create terminal instance and share the information with the component parent
   */
  private initTerminal() {
    this.terminal.open(this.terminalEl.nativeElement);
    this.terminalUpdated.emit(this.terminal);
  }

  /**
   * @inheritDoc
   */
  public ngAfterViewInit() {
    this.initTerminal();
  }

  /**
   * @inheritDoc
   */
  public ngAfterViewChecked() {
    this.fitAddon.fit();
  }

  /**
   * @inheritDoc
   */
  public ngOnDestroy() {
    this.terminal.dispose();
    this.disposed.emit();
  }
}
