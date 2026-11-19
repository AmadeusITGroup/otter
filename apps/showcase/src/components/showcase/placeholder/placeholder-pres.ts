import {
  formatDate,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import {
  form,
  FormField,
} from '@angular/forms/signals';
import {
  PlaceholderComponent,
} from '@o3r/components';
import {
  O3rComponent,
} from '@o3r/core';
import {
  TripFactsService,
} from '../../../facts/trip/trip-facts-service';
import {
  DatePickerInputPres,
} from '../../utilities';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-placeholder-pres',
  templateUrl: './placeholder-pres.html',
  styleUrls: ['./placeholder-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    DatePickerInputPres,
    PlaceholderComponent
  ]
})
export class PlaceholderPres {
  private readonly tripService = inject(TripFactsService);

  /**
   * Form model
   */
  public model = signal({
    destination: '',
    outboundDate: this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS)
  });

  /**
   * Form tree
   */
  public formTree = form(this.model);

  constructor() {
    // Initial service calls with default values
    this.tripService.updateDestination(this.model().destination);
    this.tripService.updateOutboundDate(this.model().outboundDate);

    // Track destination changes
    effect(() => {
      const destination = this.model().destination;
      untracked(() => this.tripService.updateDestination(destination));
    });

    // Track outbound date changes
    effect(() => {
      const outboundDate = this.model().outboundDate;
      untracked(() => this.tripService.updateOutboundDate(outboundDate));
    });
  }

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }
}
