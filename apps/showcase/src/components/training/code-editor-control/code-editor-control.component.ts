import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLink, NgbNavOutlet} from '@ng-bootstrap/ng-bootstrap';
import {distinctUntilChanged, map, of, repeat, Subject, throttleTime, timeout} from 'rxjs';
import {WebContainerService} from '../../../services';
import {CodeEditorTerminalComponent} from '../code-editor-terminal';

@Component({
  selector: 'code-editor-control',
  standalone: true,
  imports: [
    CodeEditorTerminalComponent,
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavLink,
    NgbNavOutlet
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './code-editor-control.component.html',
  styleUrl: './code-editor-control.component.scss'
})
export class CodeEditorControlComponent implements OnDestroy, AfterViewInit {
  /**
   * Show the terminal used as output for the command process
   */
  @Input() public showOutput = true;

  /**
   * Reference to the iframe used to display the content of the application served in the web container
   */
  @ViewChild('iframe')
  public iframeEl!: ElementRef<HTMLIFrameElement>;

  /**
   * Manage the web-container commands and outputs.
   */
  public readonly webContainerService = inject(WebContainerService);

  /**
   * Current tab displayed
   */
  public activeTab: 'preview' | 'output' | 'terminal' = 'preview';

  /**
   * Subject that will emit everytime there is activity in the terminal
   */
  public readonly terminalActivity = new Subject<void>();

  /**
   * Signal with value `true` if the terminal is active, `false` if idle
   * The terminal is considered idle if no activity is received for 2 seconds.
   */
  public readonly isTerminalActive = toSignal(this.terminalActivity.asObservable().pipe(
    throttleTime(50),
    map(() => true),
    timeout({each: 2000, with: () => of(false)}),
    distinctUntilChanged(),
    repeat()
  ));

  /**
   * @inheritDoc
   */
  public ngAfterViewInit() {
    this.webContainerService.runner.registerIframe(this.iframeEl.nativeElement);
  }

  /**
   * @inheritDoc
   */
  public ngOnDestroy() {
    this.webContainerService.runner.registerIframe(null);
  }
}
