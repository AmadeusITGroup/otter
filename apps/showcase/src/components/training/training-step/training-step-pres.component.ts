import {
  ChangeDetectionStrategy,
  Component,
  input,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AngularSplitModule, CodeEditorViewComponent, MarkdownModule],
  templateUrl: './training-step-pres.component.html',
  styleUrl: './training-step-pres.component.scss'
})
export class TrainingStepPresComponent {
  /**
   * Description of the coding project to load in the code view editor
   */
  public project = input<TrainingProject>();
  /**
   * Whether to allow the user to modify the project files in the editor
   */
  public editorMode = input<EditorMode>();
  /**
   * Training step title
   */
  public title = input<string>();
  /**
   * Training instructions to do the exercise
   */
  public instructions = input<string>();
  /**
   * Display terminal
   */
  public displayTerminal = input<boolean>(true);
}
