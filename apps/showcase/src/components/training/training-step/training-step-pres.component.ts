import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import {
  AngularSplitModule,
} from 'angular-split';
import {
  MarkdownModule,
} from 'ngx-markdown';
import {
  CodeEditorViewComponent,
  EditorMode,
  TrainingProject,
} from '../code-editor-view';

@Component({
  selector: 'o3r-training-step-pres',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AngularSplitModule, CodeEditorViewComponent, MarkdownModule],
  templateUrl: './training-step-pres.component.html',
  styleUrl: './training-step-pres.component.scss'
})
export class TrainingStepPresComponent {
  /**
   * Description of the coding project to load in the code view editor
   */
  @Input() public project?: TrainingProject;
  /**
   * Whether to allow the user to modify the project files in the editor
   */
  @Input() public editorMode?: EditorMode;
  /**
   * Training step title
   */
  @Input() public title?: string;
  /**
   * Training instructions to do the exercise
   */
  @Input() public instructions?: string;
}
