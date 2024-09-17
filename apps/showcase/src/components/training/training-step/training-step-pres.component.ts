import {Component, Input} from '@angular/core';
import {CodeEditorViewComponent, EditorMode, TrainingProject} from '../code-editor-view';

@Component({
  selector: 'o3r-training-step-pres',
  standalone: true,
  imports: [CodeEditorViewComponent],
  templateUrl: './training-step-pres.component.html',
  styleUrl: './training-step-pres.component.scss'
})
export class TrainingStepPresComponent {
  @Input() public project?: TrainingProject;
  @Input() public editorMode?: EditorMode;
}
