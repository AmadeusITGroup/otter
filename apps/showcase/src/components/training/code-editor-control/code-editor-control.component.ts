import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  ViewChild, ViewEncapsulation
} from '@angular/core';
import {WebcontainerService} from '../../../services/webcontainer/webcontainer.service';
import {CodeEditorTerminalComponent} from '../code-editor-terminal';

@Component({
  selector: 'code-editor-control',
  standalone: true,
  imports: [
    CodeEditorTerminalComponent
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './code-editor-control.component.html',
  styleUrl: './code-editor-control.component.scss'
})
export class CodeEditorControlComponent implements OnDestroy, AfterViewInit {
  @Input() public showConsole = true;

  public readonly webContainerService = inject(WebcontainerService);

  @ViewChild('iframe')
  public iframeEl!: ElementRef<HTMLIFrameElement>;

  public ngAfterViewInit() {
    this.webContainerService.runner.setIframe(this.iframeEl.nativeElement);
  }

  public ngOnDestroy() {
    this.webContainerService.runner.setIframe(null);
  }
}
