import {
  inject,
  Injectable,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  Title,
} from '@angular/platform-browser';
import {
  NavigationEnd,
  Router,
} from '@angular/router';
import {
  filter,
} from 'rxjs';
import {
  AnalyticsEventReporter,
} from '../tracker';

@Injectable({
  providedIn: 'root'
})
/**
 * Analytics service reporting the route change events
 */
export class AnalyticsRouterTracker {
  private readonly router = inject(Router);
  private readonly trackEventsService = inject(AnalyticsEventReporter);
  private readonly pageTitle = inject(Title);

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter(() => this.trackEventsService.isTrackingActive()),
      takeUntilDestroyed()
    ).subscribe((event) => this.trackEventsService.reportEvent({
      type: 'event',
      action: 'pageView',
      value: {
        title: this.pageTitle.getTitle(),
        location: event.urlAfterRedirects
      }
    }));
  }
}
