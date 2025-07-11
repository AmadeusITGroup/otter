import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'congratulations-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
  ],
  standalone: true,
  templateUrl: './congratulations-step.template.html'
})
export class CongratulationsStepComponent {
  /**
   * Title for the congratulation steps
   */
  public readonly title = input<string>();
  /**
   * Url to the training dedicated feedback form
   */
  public readonly feedbackForUrl = input<string>();
}
