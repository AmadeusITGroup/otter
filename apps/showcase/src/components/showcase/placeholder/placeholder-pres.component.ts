import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PlaceholderComponent } from '@o3r/components';
import { O3rComponent } from '@o3r/core';
import { RulesEngineRunnerModule } from '@o3r/rules-engine';
import { Subscription } from 'rxjs';
import { TripFactsService } from '../../../facts/trip/trip.facts';
import { DatePickerInputPresComponent } from '../../utilities';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-placeholder-pres',
  standalone: true,
  templateUrl: './placeholder-pres.template.html',
  styleUrls: ['./placeholder-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PlaceholderComponent,
    ReactiveFormsModule,
    RulesEngineRunnerModule,
    DatePickerInputPresComponent
  ]
})
export class PlaceholderPresComponent implements OnDestroy {
  private readonly subscription = new Subscription();

  /**
   * Form group
   */
  public form: FormGroup<{
    destination: FormControl<string | null>;
    outboundDate: FormControl<string | null>;
  }>;

  constructor(
    fb: FormBuilder,
    tripService: TripFactsService
  ) {
    this.form = fb.group({
      destination: new FormControl<string | null>(null),
      outboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS))
    });
    this.subscription.add(this.form.controls.destination.valueChanges.subscribe((destination) => tripService.updateDestination(destination)));
    this.subscription.add(this.form.controls.outboundDate.valueChanges.subscribe((outboundDate) => tripService.updateOutboundDate(outboundDate)));
  }
  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
