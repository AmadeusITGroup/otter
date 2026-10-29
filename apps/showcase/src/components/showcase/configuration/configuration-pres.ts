import {
  formatDate,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  ViewEncapsulation,
} from '@angular/core';
import {
  form,
  FormField,
} from '@angular/forms/signals';
import {
  configSignal,
  DynamicConfigurableWithSignal,
  O3rConfig,
} from '@o3r/configuration';
import {
  O3rComponent,
} from '@o3r/core';
import {
  DatePickerInputPres,
} from '../../utilities';
import {
  CONFIGURATION_PRES_CONFIG_ID,
  CONFIGURATION_PRES_DEFAULT_CONFIG,
  ConfigurationPresConfig,
} from './configuration-pres-config';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-configuration-pres',
  imports: [FormField, DatePickerInputPres],
  templateUrl: './configuration-pres.html',
  styleUrls: ['./configuration-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationPres implements DynamicConfigurableWithSignal<ConfigurationPresConfig> {
  /** Input configuration to override the default configuration of the component */
  public readonly config = input<Partial<ConfigurationPresConfig>>();
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
   * Form model – reactively resets when config changes (inXDays, destinations),
   * while remaining writable from the form.
   */
  public model = linkedSignal<{ inXDays: number; destinations: ConfigurationPresConfig['destinations'] }, { destination: string; outboundDate: string; inboundDate: string }>({
    source: () => ({
      inXDays: this.configSignal().inXDays,
      destinations: this.configSignal().destinations
    }),
    computation: ({ inXDays, destinations }, previous) => {
      if (!previous) {
        return {
          destination: '',
          outboundDate: this.formatDate(Date.now() + inXDays * ONE_DAY_IN_MS),
          inboundDate: this.formatDate(Date.now() + (inXDays + 7) * ONE_DAY_IN_MS)
        };
      }

      const prev = previous.value;
      let outboundDate = prev.outboundDate;
      let inboundDate = prev.inboundDate;
      let destination = prev.destination;

      // React to inXDays changes
      const newOutboundDate = this.formatDate(Date.now() + inXDays * ONE_DAY_IN_MS);
      if (outboundDate !== newOutboundDate) {
        outboundDate = newOutboundDate;
        if (inboundDate && inboundDate <= outboundDate) {
          inboundDate = this.formatDate(new Date(outboundDate).getTime() + 7 * ONE_DAY_IN_MS);
        }
      }

      // React to destinations changes – reset unavailable destination
      const selected = destinations.find((d) => d.cityName === destination);
      if (selected && !selected.available) {
        destination = '';
      }

      return { destination, outboundDate, inboundDate };
    }
  });

  /**
   * Form tree
   */
  public formTree = form(this.model);

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }
}
