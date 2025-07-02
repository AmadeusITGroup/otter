import {
  AsyncPipe,
  formatDate,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  input,
  type OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
} from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  configSignal,
  DynamicConfigurableWithSignal,
  O3rConfig,
} from '@o3r/configuration';
import {
  O3rComponent,
} from '@o3r/core';
import {
  DynamicContentModule,
} from '@o3r/dynamic-content';
import {
  Localization,
  LocalizationModule,
  LocalizationService,
  Translatable,
} from '@o3r/localization';
import {
  RulesEngineRunnerModule,
  RulesEngineRunnerService,
} from '@o3r/rules-engine';
import {
  TripFactsService,
} from '../../../facts/trip/trip.facts';
import {
  DatePickerInputPresComponent,
} from '../../utilities';
import {
  RULES_ENGINE_PRES_CONFIG_ID,
  RULES_ENGINE_PRES_DEFAULT_CONFIG,
  RulesEnginePresConfig,
} from './rules-engine-pres.config';
import {
  RulesEnginePresTranslation,
  translations,
} from './rules-engine-pres.translation';

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
export class RulesEnginePresComponent implements OnDestroy, DynamicConfigurableWithSignal<RulesEnginePresConfig>, Translatable<RulesEnginePresTranslation>, OnInit {
  private readonly tripService = inject(TripFactsService);
  private readonly localizationService = inject(LocalizationService);
  private readonly rulesService = inject(RulesEngineRunnerService);
  /** Localization of the component*/
  @Input()
  @Localization('./rules-engine-pres.localization.json')
  public translations: RulesEnginePresTranslation = translations;

  /**
   * Form group
   */
  public form: FormGroup<{
    destination: FormControl<string | null>;
    outboundDate: FormControl<string | null>;
    inboundDate: FormControl<string | null>;
  }> = inject(FormBuilder).group({
      destination: new FormControl<string | null>(null),
      outboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS)),
      inboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 14 * ONE_DAY_IN_MS))
    });

  /** Input configuration to override the default configuration of the component */
  public config = input<Partial<RulesEnginePresConfig>>();

  @O3rConfig()
  public readonly configSignal = configSignal(
    this.config,
    RULES_ENGINE_PRES_CONFIG_ID,
    RULES_ENGINE_PRES_DEFAULT_CONFIG
  );

  constructor() {
    this.form.controls.destination.valueChanges.pipe(takeUntilDestroyed()).subscribe((destination) => this.tripService.updateDestination(destination));
    this.form.controls.outboundDate.valueChanges.pipe(takeUntilDestroyed()).subscribe((outboundDate) => this.tripService.updateOutboundDate(outboundDate));
    const inXDays$ = toObservable(computed(() => this.configSignal().inXDays));
    inXDays$.pipe(takeUntilDestroyed()).subscribe((inXDays) => {
      this.form.controls.outboundDate.setValue(this.formatDate(Date.now() + inXDays * ONE_DAY_IN_MS));
      if (this.form.value.inboundDate && this.form.value.outboundDate && this.form.value.inboundDate <= this.form.value.outboundDate) {
        this.form.controls.inboundDate.setValue(this.formatDate((this.form.value.outboundDate ? (new Date(this.form.value.outboundDate)).getTime() : Date.now()) + 7 * ONE_DAY_IN_MS));
      }
    });
    const destinations$ = toObservable(computed(() => this.configSignal().destinations));
    destinations$.pipe(takeUntilDestroyed()).subscribe((destinations) => {
      const selectedDestination = destinations.find((d) => d.cityName === this.form.value.destination);
      if (selectedDestination && !selectedDestination.available) {
        this.form.controls.destination.reset();
      }
    });
    this.form.controls.destination.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
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
      this.localizationService.useLanguage(language);
    });
  }

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }

  public ngOnInit() {
    this.rulesService.enableRuleSetFor(RULES_ENGINE_PRES_CONFIG_ID);
  }

  public ngOnDestroy() {
    this.rulesService.disableRuleSetFor(RULES_ENGINE_PRES_CONFIG_ID);
  }
}
