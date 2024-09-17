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
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLink, NgbNavOutlet} from '@ng-bootstrap/ng-bootstrap';
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
   * Whether to show the panels - if set to false, hide all the panels and only display the tab bar
   */
  public show = true;

  /**
   * Current tab displayed
   */
  public activeTab: 'preview' | 'output' | 'terminal' = 'preview';

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
