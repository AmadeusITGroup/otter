import {
  formatDate,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  type Signal,
  Type,
  ViewEncapsulation,
} from '@angular/core';
import {
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  C11nDirective,
  C11nService,
} from '@o3r/components';
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
  DatePickerInputPresContext,
} from '../../utilities/index';
import {
  COMPONENT_REPLACEMENT_PRES_CONFIG_ID,
  COMPONENT_REPLACEMENT_PRES_DEFAULT_CONFIG,
  ComponentReplacementPresConfig,
} from './component-replacement-pres-config';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-component-replacement-pres',
  imports: [C11nDirective, ReactiveFormsModule],
  templateUrl: './component-replacement-pres.html',
  styleUrl: './component-replacement-pres.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentReplacementPres implements DynamicConfigurableWithSignal<ComponentReplacementPresConfig> {
  private readonly c11nService = inject(C11nService);

  /** Input configuration to override the default configuration of the component*/
  public config = input<Partial<ComponentReplacementPresConfig>>();

  @O3rConfig()
  public readonly configSignal = configSignal(
    this.config,
    COMPONENT_REPLACEMENT_PRES_CONFIG_ID,
    COMPONENT_REPLACEMENT_PRES_DEFAULT_CONFIG
  );

  public datePickerComponent: Signal<Type<DatePickerInputPresContext> | undefined>;

  public dateFormControl = new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS));

  constructor() {
    this.datePickerComponent = toSignal(toObservable(this.configSignal).pipe(
      // Compute which presenter to use according to the configuration and the default presenter that we define here
      this.c11nService.getPresenter(DatePickerInputPres, 'datePickerCustomKey')
    ));
  }

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }
}
