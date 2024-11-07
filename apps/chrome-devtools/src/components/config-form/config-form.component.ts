import {
  KeyValuePipe,
  NgClass,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import type {
  Configuration,
  ConfigurationModel,
} from '@o3r/configuration';
import {
  StateService,
} from '../../services';
import {
  ChromeExtensionConnectionService,
} from '../../services/connection.service';

type ControlsType = Record<string, 'boolean' | 'string' | 'number'>;

@Component({
  selector: 'app-config-form',
  templateUrl: './config-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    KeyValuePipe,
    NgClass
  ]
})
export class ConfigFormComponent {
  /**
   * Form group
   */
  public form = new UntypedFormGroup({});

  /**
   * Configuration value
   */
  public config = input.required<ConfigurationModel>();

  /**
   * Type of controls for each configuration property
   */

  public controlsType = computed<Record<string, 'boolean' | 'string' | 'number'>>(() => {
    return Object.entries(this.config()).reduce((acc: ControlsType, [key, value]) => {
      if (key !== 'id') {
        const type = typeof value;
        // TODO: add support for others config properties types
        if (type === 'boolean' || type === 'string' || type === 'number') {
          acc[key] = type;
          if (!this.form.contains(key)) {
            this.form.addControl(key, new FormControl());
          }
          this.form.controls[key].setValue(value);
        } else {
          // eslint-disable-next-line no-console -- needed to warn the user
          console.warn(`[Otter Chrome Extension] Unsupported type: ${type}`);
        }
      }
      return acc;
    }, {});
  });

  private readonly connectionService = inject(ChromeExtensionConnectionService);
  private readonly stateService = inject(StateService);

  public onSubmit() {
    void this.stateService.updateLocalState({
      configurations: {
        [this.config().id]: this.form.value as Configuration
      }
    });
    this.connectionService.sendMessage('updateConfig', {
      id: this.config().id,
      configValue: this.form.value as Configuration
    });
  }
}
