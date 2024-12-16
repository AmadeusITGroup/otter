import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import {
  NgbActiveModal,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'code-editor-terminal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
  templateUrl: './save-code-dialog.template.html'
})
export class SaveCodeDialogComponent {
  public readonly activeModal = inject(NgbActiveModal);
}
