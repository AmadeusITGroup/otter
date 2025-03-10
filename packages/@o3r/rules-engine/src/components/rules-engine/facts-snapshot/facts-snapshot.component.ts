import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import type {
  Facts,
} from '../../../engine';
import {
  O3rJsonOrStringPipe,
} from '../shared/index';

@Component({
  selector: 'o3r-facts-snapshot',
  styleUrls: ['./facts-snapshot.style.scss'],
  templateUrl: './facts-snapshot.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    O3rJsonOrStringPipe,
    FormsModule,
    ReactiveFormsModule
  ],
  encapsulation: ViewEncapsulation.None
})
export class FactsSnapshotComponent {
  /**
   * Full list of available facts with their current value
   */
  public readonly facts = input.required<{ factName: string; value: Facts }[]>();

  /**
   * Search terms
   */
  public readonly search = signal('');

  /**
   * Filtered list of facts using search terms
   */
  public readonly filteredFacts = computed(() => {
    const search = this.search();
    const facts = this.facts();
    if (search) {
      const matchString = new RegExp(search.replace(/[\s#$()*+,.?[\\\]^{|}-]/g, '\\$&'), 'i');
      return facts.filter(({ factName, value }) =>
        matchString.test(factName)
        || (typeof value === 'object'
          ? matchString.test(JSON.stringify(value))
          : matchString.test(String(value)))
      );
    } else {
      return facts;
    }
  });
}
