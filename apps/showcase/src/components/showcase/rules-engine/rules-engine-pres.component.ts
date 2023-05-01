import { AsyncPipe, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, Optional, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfigObserver, ConfigurationBaseService, ConfigurationObserver, DynamicConfigurable } from '@o3r/configuration';
import { O3rComponent } from '@o3r/core';
import { DynamicContentModule } from '@o3r/dynamic-content';
import { Localization, LocalizationModule, LocalizationService, Translatable } from '@o3r/localization';
import { RulesEngineRunnerModule } from '@o3r/rules-engine';
import { distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { TripFactsService } from '../../../facts/trip/trip.facts';
import { DatePickerInputPresComponent } from '../../utilities';
import { RULES_ENGINE_PRES_CONFIG_ID, RULES_ENGINE_PRES_DEFAULT_CONFIG, RulesEngineDestinationConfiguration, RulesEnginePresConfig } from './rules-engine-pres.config';
import { RulesEnginePresTranslation, translations } from './rules-engine-pres.translation';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-rules-engine-pres',
  standalone: true,
  templateUrl: './rules-engine-pres.template.html',
  styleUrls: ['./rules-engine-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DynamicContentModule,
    ReactiveFormsModule,
    RulesEngineRunnerModule,
    LocalizationModule,
    DatePickerInputPresComponent,
    AsyncPipe
  ]
})
export class RulesEnginePresComponent implements OnChanges, DynamicConfigurable<RulesEnginePresConfig>, Translatable<RulesEnginePresTranslation> {
  /** Localization of the component*/
  @Input()
  @Localization('./rules-engine-pres.localization.json')
  public translations: RulesEnginePresTranslation;

  private subscription = new Subscription();

  /**
   * Form group
   */
  public form: FormGroup<{
    destination: FormControl<string | null>;
    outboundDate: FormControl<string | null>;
    inboundDate: FormControl<string | null>;
  }>;

  /** Input configuration to override the default configuration of the component*/
  @Input()
  public config: Partial<RulesEnginePresConfig> | undefined;

  @ConfigObserver()
  private dynamicConfig$: ConfigurationObserver<RulesEnginePresConfig>;

  /** Configuration stream based on the input and the stored configuration*/
  public config$: Observable<RulesEnginePresConfig>;

  /** Observable of the destination */
  public destinations$: Observable<RulesEngineDestinationConfiguration[]>;

  constructor(
    @Optional() configurationService: ConfigurationBaseService,
      fb: FormBuilder,
      tripService: TripFactsService,
      localizationService: LocalizationService
  ) {
    this.dynamicConfig$ = new ConfigurationObserver<RulesEnginePresConfig>(RULES_ENGINE_PRES_CONFIG_ID, RULES_ENGINE_PRES_DEFAULT_CONFIG, configurationService);
    this.config$ = this.dynamicConfig$.asObservable();
    this.destinations$ = this.config$.pipe(map((config) => config.destinations));
    this.form = fb.group({
      destination: new FormControl<string | null>(null),
      outboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS)),
      inboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 14 * ONE_DAY_IN_MS))
    });
    this.subscription.add(this.form.controls.destination.valueChanges.subscribe((destination) => tripService.updateDestination(destination)));
    this.subscription.add(this.form.controls.outboundDate.valueChanges.subscribe((outboundDate) => tripService.updateOutboundDate(outboundDate)));
    this.subscription.add(this.config$.pipe(map(({ inXDays }) => inXDays), distinctUntilChanged()).subscribe((inXDays) => {
      this.form.controls.outboundDate.setValue(this.formatDate(Date.now() + inXDays * ONE_DAY_IN_MS));
      if (this.form.value.inboundDate && this.form.value.outboundDate && this.form.value.inboundDate <= this.form.value.outboundDate) {
        this.form.controls.inboundDate.setValue(this.formatDate((this.form.value.outboundDate ? (new Date(this.form.value.outboundDate)).getTime() : Date.now()) + 7 * ONE_DAY_IN_MS));
      }
    }));
    this.subscription.add(this.config$.pipe(map(({ destinations }) => destinations)).subscribe((destinations) => {
      const selectedDestination = destinations.find((d) => d.cityName === this.form.value.destination);
      if (selectedDestination && !selectedDestination.available) {
        this.form.controls.destination.reset();
      }
    }));
    this.translations = translations;
    this.subscription.add(
      this.form.controls.destination.valueChanges.subscribe((value) => {
        let language = 'en-GB';
        switch (value) {
          case 'PAR': {
            language = 'fr-FR';
            break;
          }
          case 'NYC': {
            language = 'en-US';
            break;
          }
        }
        localizationService.useLanguage(language);
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

}
