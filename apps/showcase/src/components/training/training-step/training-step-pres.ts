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
  CodeEditorView,
  EditorMode,
  TrainingProject,
} from '../code-editor-view';

@Component({
  selector: 'o3r-training-step-pres',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AngularSplitModule, CodeEditorView, MarkdownModule],
  templateUrl: './training-step-pres.html',
  styleUrl: './training-step-pres.scss'
})
export class TrainingStepPres {
  /**
   * Description of the coding project to load in the code view editor
   */
  public readonly project = input<TrainingProject | undefined | null>();
  /**
   * Whether to allow the user to modify the project files in the editor
   */
  public readonly editorMode = input<EditorMode>();
  /**
   * Training step title
   */
  public readonly title = input<string>();
  /**
   * Training instructions to do the exercise
   */
  public readonly instructions = input<string>();
  /**
   * Display terminal
   */
  public readonly displayTerminal = input<boolean>(true);
}
