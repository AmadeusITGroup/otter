import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AnalyticsEventReporter } from '../tracker';
import { Title } from '@angular/platform-browser';

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
      filter(() => this.trackEventsService.isTrackingActive())
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
