import {
  formatDate,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  PlaceholderModule,
} from '@o3r/components';
import {
  O3rComponent,
} from '@o3r/core';
import {
  RulesEngineRunnerModule,
} from '@o3r/rules-engine';
import {
  TripFactsService,
} from '../../../facts/trip/trip.facts';
import {
  DatePickerInputPresComponent,
} from '../../utilities';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-placeholder-pres',
  templateUrl: './placeholder-pres.template.html',
  styleUrls: ['./placeholder-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PlaceholderModule,
    ReactiveFormsModule,
    RulesEngineRunnerModule,
    DatePickerInputPresComponent
  ]
})
export class PlaceholderPresComponent {
  private readonly tripService = inject(TripFactsService);

  /**
   * Form group
   */
  public form: FormGroup<{ destination: FormControl<string | null>; outboundDate: FormControl<string | null> }> = inject(FormBuilder).group({
    destination: new FormControl<string | null>(null),
    outboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS))
  });

  constructor() {
    this.form.controls.destination.valueChanges.pipe(takeUntilDestroyed()).subscribe((destination) => this.tripService.updateDestination(destination));
    this.form.controls.outboundDate.valueChanges.pipe(takeUntilDestroyed()).subscribe((outboundDate) => this.tripService.updateOutboundDate(outboundDate));
  }

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }
}
