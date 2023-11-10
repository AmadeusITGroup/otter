import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, Optional, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfigObserver, ConfigurationBaseService, ConfigurationObserver, DynamicConfigurable } from '@o3r/configuration';
import { O3rComponent } from '@o3r/core';
import { distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { DatePickerInputPresComponent } from '../../utilities';
import { CONFIGURATION_PRES_CONFIG_ID, CONFIGURATION_PRES_DEFAULT_CONFIG, ConfigurationPresConfig, DestinationConfiguration } from './configuration-pres.config';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-configuration-pres',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerInputPresComponent],
  templateUrl: './configuration-pres.template.html',
  styleUrls: ['./configuration-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationPresComponent implements OnChanges, OnDestroy, DynamicConfigurable<ConfigurationPresConfig> {
  /** Configuration stream based on the input and the stored configuration*/
  public config$: Observable<ConfigurationPresConfig>;

  @ConfigObserver()
  private dynamicConfig$: ConfigurationObserver<ConfigurationPresConfig>;

  /** Input configuration to override the default configuration of the component*/
  @Input()
  public config: Partial<ConfigurationPresConfig> | undefined;

  /**
   * Form group
   */
  public form: FormGroup<{ destination: FormControl<string | null>; outboundDate: FormControl<string | null>; inboundDate: FormControl<string | null> }>;

  private subscription = new Subscription();

  constructor(@Optional() configurationService: ConfigurationBaseService, fb: FormBuilder) {
    this.dynamicConfig$ = new ConfigurationObserver<ConfigurationPresConfig>(CONFIGURATION_PRES_CONFIG_ID, CONFIGURATION_PRES_DEFAULT_CONFIG, configurationService);
    this.config$ = this.dynamicConfig$.asObservable();
    this.form = fb.group({
      destination: new FormControl<string | null>(null),
      outboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS)),
      inboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 14 * ONE_DAY_IN_MS))
    });
    this.subscription.add(
      this.config$.pipe(map(({ inXDays }) => inXDays), distinctUntilChanged()).subscribe((inXDays) => {
        this.form.controls.outboundDate.setValue(this.formatDate(Date.now() + inXDays * ONE_DAY_IN_MS));
        if (this.form.value.inboundDate && this.form.value.outboundDate && this.form.value.inboundDate <= this.form.value.outboundDate) {
          this.form.controls.inboundDate.setValue(
            this.formatDate((this.form.value.outboundDate ? (new Date(this.form.value.outboundDate)).getTime() : Date.now()) + 7 * ONE_DAY_IN_MS)
          );
        }
      })
    );
    this.subscription.add(
      this.config$.pipe(map(({ destinations }) => destinations)).subscribe((destinations) => {
        const selectedDestination = destinations.find((d) => d.cityName === this.form.value.destination);
        if (selectedDestination && !selectedDestination.available) {
          this.form.controls.destination.reset();
        }
      })
    );
  }

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.config) {
      this.dynamicConfig$.next(this.config);
    }
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public trackByCityName(_index: number, option: DestinationConfiguration) {
    return option.cityName;
  }
}
