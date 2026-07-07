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
  imports: [],
  templateUrl: './save-code-dialog.html'
})
export class SaveCodeDialog {
  public readonly activeModal = inject(NgbActiveModal);
}
