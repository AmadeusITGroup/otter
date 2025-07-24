import {
  AsyncPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import {
  Observable,
} from 'rxjs';
import {
  AppState,
  ChromeExtensionConnectionService,
} from '../../services/connection.service';

@Component({
  selector: 'app-connection',
  templateUrl: './app-connection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe
  ]
})
export class AppConnectionComponent {
  private readonly connectionService = inject(ChromeExtensionConnectionService);

  /** Stream of application's state */
  public appState$: Observable<AppState> = this.connectionService.appState$;

  constructor() {
    this.connectionService.activate();
  }
}
