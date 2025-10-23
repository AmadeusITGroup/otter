import {
  AsyncPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  NgbAccordionModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  ConfigurationModel,
} from '@o3r/configuration';
import {
  combineLatest,
  Observable,
} from 'rxjs';
import {
  map,
  startWith,
} from 'rxjs/operators';
import {
  ConfigForm,
} from '../../components/config-form/config-form';
import {
  ChromeExtensionConnectionService,
  filterAndMapMessage,
  isConfigurationsMessage,
} from '../../services/connection-service';

@Component({
  selector: 'o3r-config-panel-pres',
  templateUrl: './config-panel-pres.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgbAccordionModule,
    ConfigForm,
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe
  ]
})
export class ConfigPanelPres {
  public filteredConfigs$: Observable<ConfigurationModel[]>;

  public form = new FormGroup({
    search: new FormControl('')
  });

  constructor() {
    const connectionService = inject(ChromeExtensionConnectionService);

    connectionService.sendMessage(
      'requestMessages',
      {
        only: ['configurations']
      }
    );
    const configs$ = connectionService.message$.pipe(
      filterAndMapMessage(
        isConfigurationsMessage,
        (message) => Object.values(message.configurations)
          .filter((config): config is ConfigurationModel => !!config)
      )
    );
    this.filteredConfigs$ = combineLatest([
      configs$,
      this.form.controls.search.valueChanges.pipe(
        startWith(''),
        map((search) => search?.toLowerCase())
      )
    ]).pipe(
      map(([configs, search]) => search
        ? configs.filter((config) => Object.keys(config)
          .map((key) => (key === 'id' ? config.id : key).toLowerCase())
          .some((key) => key.includes(search))
        )
        : configs
      )
    );
  }
}
