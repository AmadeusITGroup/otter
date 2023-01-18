import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ConfigurationModel } from '@o3r/configuration';
import { ChromeExtensionConnectionService } from '../../services/connection.service';

@Component({
  selector: 'app-config-form',
  templateUrl: './config-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigFormComponent implements OnChanges {
  /**
   * Configuration value
   */
  @Input()
  public config!: ConfigurationModel;

  /**
   * Type of controls for each configuration property
   */
  public controlsType: { [key: string]: 'boolean' | 'string' | 'number' } = {};

  /**
   * Form group
   */
  public form: FormGroup;

  constructor(
    private connectionService: ChromeExtensionConnectionService,
    fb: FormBuilder
  ) {
    this.form = fb.group({});
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.config) {
      Object.keys(this.form.controls).forEach((controlName) => this.form.removeControl(controlName));
      this.controlsType = {};
      Object.keys(this.config).forEach((key) => {
        const type = typeof this.config[key];
        // TODO: add support for others config properties types
        if (type === 'boolean' || type === 'string' || type === 'number') {
          this.controlsType[key] = type;
          if (!this.form.contains(key)) {
            this.form.addControl(key, new FormControl());
          }
          this.form.controls[key].setValue(this.config[key]);
        } else {
          console.warn(`[Otter Chrome Extension] Unsupported type: ${type}`);
        }
      });
    }
  }

  public onSubmit() {
    this.connectionService.sendMessage('updateConfig', {
      id: this.form.value.id,
      configValue: this.form.value
    });
  }
}
