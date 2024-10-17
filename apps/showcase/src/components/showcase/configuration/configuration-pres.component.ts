import { AsyncPipe, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { configSignal, DynamicConfigurableWithSignal, O3rConfig } from '@o3r/configuration';
import { O3rComponent } from '@o3r/core';
import { DatePickerInputPresComponent } from '../../utilities';
import { CONFIGURATION_PRES_CONFIG_ID, CONFIGURATION_PRES_DEFAULT_CONFIG, ConfigurationPresConfig } from './configuration-pres.config';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-configuration-pres',
  standalone: true,
  imports: [ReactiveFormsModule, DatePickerInputPresComponent, AsyncPipe],
  templateUrl: './configuration-pres.template.html',
  styleUrls: ['./configuration-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationPresComponent implements DynamicConfigurableWithSignal<ConfigurationPresConfig> {
  private readonly fb = inject(FormBuilder);

  /** Input configuration to override the default configuration of the component */
  public config = input<Partial<ConfigurationPresConfig>>();
  /** Configuration signal based on the input and the stored configuration */
  @O3rConfig()
  public configSignal = configSignal(
      this.config,
      CONFIGURATION_PRES_CONFIG_ID,
      CONFIGURATION_PRES_DEFAULT_CONFIG
    );

  public destinations = computed(() => this.configSignal().destinations);
  public shouldProposeRoundTrip = computed(() => this.configSignal().shouldProposeRoundTrip);

  /**
   * Form group
   */
  public form = this.fb.group({
    destination: new FormControl<string | null>(null),
    outboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS)),
    inboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 14 * ONE_DAY_IN_MS))
  });

  constructor() {
    const inXDays = computed(() => this.configSignal().inXDays);
    effect(
      () => {
        this.form.controls.outboundDate.setValue(this.formatDate(Date.now() + inXDays() * ONE_DAY_IN_MS));
        if (this.form.value.inboundDate && this.form.value.outboundDate && this.form.value.inboundDate <= this.form.value.outboundDate) {
          this.form.controls.inboundDate.setValue(
            this.formatDate((this.form.value.outboundDate ? (new Date(this.form.value.outboundDate)).getTime() : Date.now()) + 7 * ONE_DAY_IN_MS)
          );
        }
      },
      // Needed because inboundDate input is handled by signal
      { allowSignalWrites: true }
    );
    effect(
      () => {
        const selectedDestination = this.destinations().find((d) => d.cityName === this.form.value.destination);
        if (selectedDestination && !selectedDestination.available) {
          this.form.controls.destination.reset();
        }
      },
      // Needed because destination input is handled by signal
      { allowSignalWrites: true }
    );
  }

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }
}
