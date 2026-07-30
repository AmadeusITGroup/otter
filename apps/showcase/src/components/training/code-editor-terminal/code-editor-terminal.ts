import {
  type AfterViewChecked,
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  output,
  viewChild,
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
  imports: [],
  template: '<div #terminal class="h-100"></div>'
})
export class CodeEditorTerminal implements AfterViewChecked, AfterViewInit {
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
  public terminalEl = viewChild.required<ElementRef<HTMLDivElement>>('terminal');

  /**
   * Inform the parent that the terminal of the component has been created and is ready to use as input/output
   * of a process
   */
  public readonly terminalUpdated = output<Terminal>();

  /**
   * Inform the parent that something got written in the terminal
   */
  public readonly terminalActivity = output<void>();

  /**
   * Inform the parent that the terminal of the component has been disposed of
   */
  public readonly disposed = output<void>();

  constructor() {
    this.terminal.loadAddon(this.fitAddon);
    const disposable = this.terminal.onWriteParsed(() => {
      this.terminalActivity.emit();
    });
    inject(DestroyRef).onDestroy(() => {
      disposable.dispose();
      this.terminal.dispose();
      this.disposed.emit();
    });
  }

  /**
   * Create terminal instance and share the information with the component parent
   */
  private initTerminal() {
    this.terminal.open(this.terminalEl().nativeElement);
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
}
