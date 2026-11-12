import {
  formatDate,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Input,
  input,
  linkedSignal,
  type OnDestroy,
  OnInit,
  untracked,
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
  O3rDynamicContentPipe,
} from '@o3r/dynamic-content';
import {
  RulesEngineRunnerService,
} from '@o3r/rules-engine';
import {
  Localization,
  LocalizationService,
  O3rLocalizationTranslatePipe,
  Translatable,
} from '@o3r/transloco';
import {
  TripFactsService,
} from '../../../facts/trip/trip-facts-service';
import {
  DatePickerInputPres,
} from '../../utilities';
import {
  RULES_ENGINE_PRES_CONFIG_ID,
  RULES_ENGINE_PRES_DEFAULT_CONFIG,
  RulesEnginePresConfig,
} from './rules-engine-pres-config';
import {
  RulesEnginePresTranslation,
  translations,
} from './rules-engine-pres-translation';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-rules-engine-pres',
  templateUrl: './rules-engine-pres.html',
  styleUrls: ['./rules-engine-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    O3rDynamicContentPipe,
    O3rLocalizationTranslatePipe,
    FormField,
    DatePickerInputPres
  ]
})
export class RulesEnginePres implements OnDestroy, DynamicConfigurableWithSignal<RulesEnginePresConfig>, Translatable<RulesEnginePresTranslation>, OnInit {
  private readonly tripService = inject(TripFactsService);
  private readonly localizationService = inject(LocalizationService);
  private readonly rulesService = inject(RulesEngineRunnerService);
  /** Localization of the component*/
  @Input()
  @Localization('./rules-engine-pres-localization.json')
  public translations: RulesEnginePresTranslation = translations;

  /**
   * Form model – reactively resets when config changes (inXDays, destinations),
   * while remaining writable from the form.
   */
  public model = linkedSignal<{ inXDays: number; destinations: RulesEnginePresConfig['destinations'] }, { destination: string; outboundDate: string; inboundDate: string }>({
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

  /** Input configuration to override the default configuration of the component */
  public readonly config = input<Partial<RulesEnginePresConfig>>();

  @O3rConfig()
  public readonly configSignal = configSignal(
    this.config,
    RULES_ENGINE_PRES_CONFIG_ID,
    RULES_ENGINE_PRES_DEFAULT_CONFIG
  );

  constructor() {
    // Track destination changes and update trip service + language
    effect(() => {
      const destination = this.model().destination;
      untracked(() => {
        this.tripService.updateDestination(destination);
        let language = 'en-GB';
        switch (destination) {
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
    });

    // Track outbound date changes and update trip service
    effect(() => {
      const outboundDate = this.model().outboundDate;
      untracked(() => this.tripService.updateOutboundDate(outboundDate));
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
