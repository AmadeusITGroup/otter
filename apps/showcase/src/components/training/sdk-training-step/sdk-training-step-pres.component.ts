import { Component, Input } from '@angular/core';
import { FileSystemTree } from '@webcontainer/api';
import { CodeEditorViewComponent, EditorMode } from '../code-editor-view';

@Component({
  selector: 'o3r-sdk-training-step-pres',
  standalone: true,
  imports: [CodeEditorViewComponent],
  templateUrl: './sdk-training-step-pres.component.html',
  styleUrl: './sdk-training-step-pres.component.scss'
})
export class SdkTrainingStepPresComponent {

  @Input() public filesContent?: FileSystemTree;
  @Input() public startingFile?: string;
  @Input() public editorMode?: EditorMode;
  @Input() public commands?: string[];

  private readonly widthSelection = 50;
  public leftWidthPercent = `${this.widthSelection}%`;
  public rightWidthPercent = `${100 - this.widthSelection}%`;
}
