import {
  effect,
  inject,
  Inject,
  Injectable,
  signal,
  untracked,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  LoggerService,
} from '@o3r/logger';
import {
  ReplaySubject,
} from 'rxjs';
import type {
  AnalyticsAvailableEvents,
  ReportedEvent,
} from '../../events/base.interface';
import type {
  AnalyticsHookOptions,
  AnalyticsThirdPartyService,
} from '../../third-party/analytics-third-party.interfaces';
import {
  ANALYTICS_REPORTER_CONFIGURATION,
  type AnalyticsReporterConfiguration,
} from './analytics-reporter.configuration';

@Injectable({
  providedIn: 'root'
})
/** Analytics Event Reporter */
export class AnalyticsEventReporter {
  private readonly stack;
  private readonly services;
  private readonly hookOptions: AnalyticsHookOptions = {
    logger: inject(LoggerService, { optional: true }) ?? undefined
  };

  /** Stream of the events reported to the Analytics service */
  public readonly events$;
  /** Determine and define if the tracking service is activated and if the captured events should be emitted to the registered Analytics services */
  public readonly isTrackingActive;
  /** List if of the Analytics services to report the events too */
  public readonly analyticsServices;

  constructor(@Inject(ANALYTICS_REPORTER_CONFIGURATION) config: AnalyticsReporterConfiguration) {
    this.stack = new ReplaySubject<ReportedEvent>(config.eventStackSize);
    this.isTrackingActive = signal(config.activatedOnBootstrap);
    this.services = signal(config.registeredAnalyticsServicesOnBootstrap || []);

    this.analyticsServices = this.services.asReadonly();
    this.events$ = this.stack.asObservable().pipe(
      takeUntilDestroyed()
    );

    effect(async () => {
      const isTrackingActive = this.isTrackingActive();
      await untracked(() => Promise.all(isTrackingActive
        ? this.analyticsServices()
          .filter((service) => !!service.onActivation)
          .map((service) => service.onActivation!(this.hookOptions))
        : this.analyticsServices()
          .filter((service) => !!service.onDeactivation)
          .map((service) => service.onDeactivation!(this.hookOptions))
      ));
    });
  }

  private reportAnalytics<T extends AnalyticsAvailableEvents>(report: T) {
    this.stack.next({
      reportedAt: Date.now(),
      report
    });
  }

  /**
   * Register a third party Analytics service to report events to
   * @param services Third party Analytics service
   */
  public async registerAnalyticsServices(services: AnalyticsThirdPartyService | AnalyticsThirdPartyService[]) {
    const serviceList = Array.isArray(services) ? services : [services];

    await Promise.all(
      serviceList
        .filter((service) => !!service.onRegistration)
        .map((service) => service.onRegistration!())
    );

    this.services.update((analyticsServices) => [
      ...analyticsServices,
      ...serviceList
    ]);

    serviceList
      .forEach((service) => this.events$
        .pipe(takeUntilDestroyed())
        .subscribe((event) => service.emit(event, this.hookOptions))
      );

    if (this.isTrackingActive()) {
      await Promise.all(
        serviceList
          .filter((service) => !!service.onActivation)
          .map((service) => service.onActivation!(this.hookOptions))
      );
    }
  }

  /**
   * Report an Event to the Analytics services
   * @param event Event to emit the the Analytics services
   * @param enforceStorage Determine if the event should be stored in the stack even is if the service is not activated\
   */
  public reportEvent<T extends AnalyticsAvailableEvents>(event: T, enforceStorage = false) {
    if (enforceStorage || this.isTrackingActive()) {
      this.reportAnalytics(event);
    }
  }
}
