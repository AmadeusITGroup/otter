import { Configuration } from '@o3r/core';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { getConfiguration } from '../core';
import { ConfigurationBaseService } from '../services/configuration/configuration.base.service';

export class ConfigurationObserver<T extends Configuration> implements Observer<Partial<T> | undefined> {

  /** Inner observable */
  private observable: Observable<T>;

  /** Inner subscriber */
  private subscriber: BehaviorSubject<Partial<T>> = new BehaviorSubject<Partial<T>>({});

  /** @inheritdoc */
  public closed?: boolean;

  constructor(
    /** Configuration ID */
    public configId: string,
    defaultConfig: T,
    configurationService?: ConfigurationBaseService
  ) {
    if (configurationService) {
      configurationService.extendConfiguration(defaultConfig, configId);
    }

    this.observable = this.subscriber
      .pipe(
        configurationService ? configurationService.getComponentConfig(configId, defaultConfig) : getConfiguration(defaultConfig),
        shareReplay(1)
      );
  }

  /** @inheritdoc */
  public next(value?: Partial<T>): void {
    this.subscriber.next(value || {});
  }

  /** @inheritdoc */
  public error(err: any): void {
    this.subscriber.error(err);
    this.closed = true;
  }

  /** @inheritdoc */
  public complete(): void {
    this.subscriber.complete();
    this.closed = true;
  }

  /** @see Subject.asObservable */
  public asObservable(): Observable<T> {
    return this.observable;
  }
}
