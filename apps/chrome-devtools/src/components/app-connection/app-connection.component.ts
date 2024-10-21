import {
  AsyncPipe
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy
} from '@angular/core';
import {
  Observable,
  Subscription
} from 'rxjs';
import {
  AppState,
  ChromeExtensionConnectionService
} from '../../services/connection.service';

@Component({
  selector: 'app-connection',
  templateUrl: './app-connection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AsyncPipe
  ]
})
export class AppConnectionComponent implements OnDestroy {
  private readonly subscription = new Subscription();
  private readonly connectionService = inject(ChromeExtensionConnectionService);

  /** Stream of application's state */
  public appState$: Observable<AppState> = this.connectionService.appState$;

  constructor() {
    this.connectionService.activate();
  }

  /** @inheritDoc */
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
