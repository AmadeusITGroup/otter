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
  template: `
  <div class="modal-header">
    <h2 class="modal-title">Code modifications detected</h2>
  </div>
  <div class="modal-body">
    <p>Do you want to keep your previous changes or discard them?</p>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-outline-danger me-5" (click)="activeModal.close(false)">Discard</button>
    <button type="button" class="btn btn-primary" ngbAutofocus (click)="activeModal.close(true)">Keep</button>
  </div>
  `
})
export class SaveCodeDialogComponent {
  public readonly activeModal = inject(NgbActiveModal);
}
