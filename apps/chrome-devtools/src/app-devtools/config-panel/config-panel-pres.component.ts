import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import type { Dictionary } from '@ngrx/entity';
import { ConfigurationModel } from '@o3r/configuration';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ChromeExtensionConnectionService, isConfigurationsMessage } from '../../services/connection.service';

@Component({
  selector: 'o3r-config-panel-pres',
  templateUrl: './config-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ConfigPanelPresComponent {
  public configs$: Observable<Dictionary<ConfigurationModel>>;

  constructor(connectionService: ChromeExtensionConnectionService) {
    connectionService.sendMessage(
      'requestMessages',
      {
        only: 'configurations'
      }
    );
    this.configs$ = connectionService.message$.pipe(
      filter(isConfigurationsMessage),
      map((message) => message.configurations)
    );
  }
}
