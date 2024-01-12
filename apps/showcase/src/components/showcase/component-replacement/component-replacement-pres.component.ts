import { ChangeDetectionStrategy, Component, Input, OnChanges, Optional, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Context, O3rComponent } from '@o3r/core';
import { ConfigObserver } from '@o3r/configuration';
import { ConfigurationBaseService } from '@o3r/configuration';
import { ConfigurationObserver } from '@o3r/configuration';
import { DynamicConfigurable } from '@o3r/configuration';
import { COMPONENT_REPLACEMENT_PRES_DEFAULT_CONFIG } from './component-replacement-pres.config';
import { COMPONENT_REPLACEMENT_PRES_CONFIG_ID } from './component-replacement-pres.config';
import { ComponentReplacementPresConfig } from './component-replacement-pres.config';
import { Observable } from 'rxjs';
import { DatePickerInputPresComponent } from '../../utilities/date-picker-input/date-picker-input-pres.component';
import { Configuration } from '@o3r/core';
import { DatePickerInputPresContextInput, DatePickerInputPresContextOutput } from '../../utilities/date-picker-input/date-picker-input-pres.context';
import { C11nModule, C11nService } from '@o3r/components';
import { CommonModule, formatDate } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-component-replacement-pres',
  standalone: true,
  imports: [C11nModule, CommonModule, ReactiveFormsModule],
  templateUrl: './component-replacement-pres.template.html',
  styleUrl: './component-replacement-pres.style.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentReplacementPresComponent implements OnChanges, DynamicConfigurable<ComponentReplacementPresConfig> {

  /** Configuration stream based on the input and the stored configuration*/
  public config$: Observable<ComponentReplacementPresConfig>;

  @ConfigObserver()
  private readonly dynamicConfig$: ConfigurationObserver<ComponentReplacementPresConfig>;

  /** Input configuration to override the default configuration of the component*/
  @Input()
  public config: Partial<ComponentReplacementPresConfig> | undefined;

  /** Observable of the presenter that we want to use, processed by the c11n directive */
  public presenter$!: Observable<Context<DatePickerInputPresContextInput, DatePickerInputPresContextOutput> & DynamicConfigurable<Configuration>>;

  public dateFormControl = new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS));

  constructor(
    private readonly c11nService: C11nService,
    @Optional() configurationService: ConfigurationBaseService) {
    this.dynamicConfig$ = new ConfigurationObserver<ComponentReplacementPresConfig>(COMPONENT_REPLACEMENT_PRES_CONFIG_ID, COMPONENT_REPLACEMENT_PRES_DEFAULT_CONFIG, configurationService);
    this.config$ = this.dynamicConfig$.asObservable();
    this.loadPresenter();
    this.dynamicConfig$.next({ ...this.config, datePickerCustomKey: 'exampleDatePickerFlavorHebrew' });
  }

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }

  private loadPresenter() {
    this.presenter$ = this.config$.pipe(
      // Compute which presenter to use according to the configuration and the default presenter that we define here
      this.c11nService.getPresenter(DatePickerInputPresComponent, 'datePickerCustomKey')
    );
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.config) {
      this.dynamicConfig$.next(this.config);
    }
  }

}
