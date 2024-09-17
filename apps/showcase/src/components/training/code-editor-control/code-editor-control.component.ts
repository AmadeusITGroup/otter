import {
  AfterViewInit,
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
    NgbNavItem,
    NgbNavLink,
    NgbNavContent,
    NgbNavOutlet
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './code-editor-control.component.html',
  styleUrl: './code-editor-control.component.scss'
})
export class CodeEditorControlComponent implements OnDestroy, AfterViewInit {
  @Input() public showOutput = true;

  @ViewChild('iframe')
  public iframeEl!: ElementRef<HTMLIFrameElement>;

  public readonly webContainerService = inject(WebContainerService);
  public activeTab = 'preview';

  public ngAfterViewInit() {
    this.webContainerService.runner.registerIframe(this.iframeEl.nativeElement);
  }

  public ngOnDestroy() {
    this.webContainerService.runner.registerIframe(null);
  }

  public activateTab(tab: string) {
    this.activeTab = tab;
  }
}
